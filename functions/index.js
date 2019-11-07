const functions = require('firebase-functions');
const admin = require('firebase-admin');
const expressApp = require('./express-app');
const uploadFunction = require('./upload-function');
const result = require('./client-messenger');
const DiscoveryV1 = require('ibm-watson/discovery/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const keys = require('./config')

admin.initializeApp({
    credential: admin.credential.cert(keys.serviceAccount),
    databaseURL: "https://ibmcsa-b542b.firebaseio.com"
});

global.keys = keys;
global.discoveryClient = new DiscoveryV1({
authenticator: new IamAuthenticator({ apikey: keys.apikey }),
serviceUrl: 'https://gateway-wdc.watsonplatform.net/discovery/api',
version: '2019-02-01',
});

exports.app = functions.https.onRequest(expressApp.app);

exports.uploadFile = functions.https.onCall((data, context) => {
    const name = data.name;
    const text = data.text;
    const uid = context.auth.uid;
    return uploadFunction.uploadFileToFirebaseAndIBM({filename: name, text: text}, uid).then(response => {
        return result.resolve(response);
    }).catch(error => {
        return result.reject(error.message);
    });
});

exports.updateEmail = functions.https.onCall((data, context) => {
    const email = data.email;

    return admin.auth().updateUser(context.auth.uid, {
        email: email
    }).then(user => {
        return result.resolve("Email updated successfully");
    }).catch(error => {
        return result.reject("Failed to update email");
    })

});

exports.updateName = functions.https.onCall((data, context) => {
    const firstName = data.firstName;
    const lastName = data.lastName;

    return admin.auth().updateUser(context.auth.uid, {
        displayName: firstName + ' ' + lastName
    }).then((user) => {
        return result.resolve("Name updated successfully");
    }).catch(error => {
        return result.reject("Failed to update email");
    });
});

exports.updatePassword = functions.https.onCall((data, context) => {
    if(data.password !== data.confirm) {
        return result.reject("Confirm your password");
    }
    return admin.auth().updateUser(context.auth.uid, {
        password: data.password
    }).then((user) => {
        return result.resolve("Password updated successfully")
    }).catch(error => {
        return result.reject("Failed to update password");
    });
});

exports.registerUser = functions.https.onCall((data, context) => {
    if(data.password !== data.confirm) {
        return result.reject("Confirm your password");
    }

    return admin.auth().createUser({
        email: data.email,
        emailVerified: false,
        phoneNumber: undefined,
        password: data.password,
        displayName: data.firstName + ' ' + data.lastName,
        photoURL: undefined,
        disabled: false
    }).then((user) => {
        return result.resolve("User was registered successfully!")
    })
    .catch(error => {
        console.log(error)
        switch(error.code) {
            case 'auth/invalid-password':
                return result.reject("The password must be a string with at least 6 characters");
            case 'auth/credential-already-in-use':
                return result.reject("The credential provided is already in use")
            case 'auth/email-already-in-use':
                return result.reject("The email provided is already in use")
            case 'auth/account-exists-with-different-credential':
                return result.reject("An account already exists with the provided credentials");
            case 'auth/too-many-requests':
                return result.reject("You have attempted to register too many times and have been locked out");
            default:
                return result.reject("An error occured while registering user");
        }
    });
});