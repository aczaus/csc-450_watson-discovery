const functions = require('firebase-functions');
const admin = require('firebase-admin');
const expressApp = require('./express-app');
const DiscoveryV1 = require('ibm-watson/discovery/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const keys = require('./config')

admin.initializeApp({
    credential: admin.credential.cert(keys.serviceAccount),
    databaseURL: "https://ibmcsa-b542b.firebaseio.com"
});

const discoveryClient = new DiscoveryV1({
authenticator: new IamAuthenticator({ apikey: keys.apikey }),
serviceUrl: 'https://gateway-wdc.watsonplatform.net/discovery/api',
version: '2019-02-01',
});

exports.app = functions.https.onRequest(expressApp.app);

exports.getUserFiles = functions.https.onCall((data, context) => {
    return admin.firestore().collection('Users').doc(context.auth.uid).collection('uploads').get().then(snapshot => {
        var uploadedFiles = []
        snapshot.forEach(doc => {
            var newElement = {
                name: doc.data().name,
                date: doc.data().date
            }
            uploadedFiles.push(newElement)
        });
        return uploadedFiles;
    }).catch(error => {
        console.error(error);
    });
});

exports.uploadFile = functions.https.onCall((data, context) => {
    const name = data.name;
    const text = data.text;
    const uid = context.auth.uid;
    const timestamp = admin.firestore.Timestamp.now();
    let counter = 0;
    let lastUpload = new admin.firestore.Timestamp(0,0);
    let counterError = false;
    let counterDate = null;
    const userRef = admin.firestore().collection("Users").doc(uid);
    const batch = admin.firestore().batch();
    return userRef.get().then(doc => {
        counter = doc.get('uploadCounter') || counter;
        lastUpload = doc.get('lastUpload') || lastUpload;
        const waitTime = 3600;
        const difference = timestamp.seconds - lastUpload.seconds;
        if(difference > waitTime) {
            counter = 0;
        }
        if(counter >= 10) {
            const timeLeft = waitTime - difference;
            counterDate = new Date({seconds: timeLeft});
            counterError = true;
            return Promise.reject(new Error(""));
        }
        else{
            return discoveryClient.addDocument({
                environmentId: keys.environmentId,
                collectionId: keys.collectionId,
                file: text,
            });
        }
    }).then(result => {
        batch.set(userRef, {uploadCounter: counter + 1, lastUpload: timestamp}, {merge: true});
        batch.set(userRef.collection("history").doc(), {name: name, date: timestamp});
        return batch.commit();
    }).then(_ => {
        return;
    }).catch(error => {
        console.log(error);
        if(counterError) {
            throw new functions.https.HttpsError(
                "invalid-argument", 
                "The amount of uploads for this account has exceeded the limit.  Try again in (" + counterDate.getSeconds() + ") minutes");
        }
        else {
            throw new functions.https.HttpsError('internal', "An error occured while attempting to upload the file");
        }
    });

});

exports.updateEmail = functions.https.onCall((data, context) => {
    const email = data.email;

    return admin.auth().updateUser(context.auth.uid, {
        email: email
    }).then(user => {
        return {user: user};
    }).catch(error => {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    })

});

exports.updateName = functions.https.onCall((data, context) => {
    const firstName = data.firstName;
    const lastName = data.lastName;

    return admin.auth().updateUser(context.auth.uid, {
        displayName: firstName + ' ' + lastName
    }).then((user) => {
        return {user: user};
    }).catch(error => {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    });
});

exports.updatePassword = functions.https.onCall((data, context) => {
    const password = data.password;
    const confirm = data.confirm;

    if( password !== confirm) {
        throw new functions.https.HttpsError('invalid-argument', "Confirm your password");
    }

    return admin.auth().updateUser(context.auth.uid, {
        password: password
    }).then((user) => {
        return {user: user};
    }).catch(error => {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    });
});

exports.registerUser = functions.https.onCall((data, context) => {
    const email = data.email;
    const password = data.password;
    const confirm = data.confirm;
    const firstName = data.firstName;
    const lastName = data.lastName;

    if(password !== confirm) {
        throw new functions.https.HttpsError('invalid-argument', "Confirm your password");
    }

    return admin.auth().createUser({
        email: email,
        emailVerified: false,
        phoneNumber: undefined,
        password: password,
        displayName: firstName + ' ' + lastName,
        photoURL: undefined,
        disabled: false
    }).then((user) => {
        return {user: user};
    })
    .catch(error => {
        throw new functions.https.HttpsError('invalid-argument', error.message);
    });

});