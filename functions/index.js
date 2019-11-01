const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require("./ibmcsa-b542b-firebase-adminsdk-wmqg6-4667a6f3f7");
const expressApp = require('./express-app');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ibmcsa-b542b.firebaseio.com"
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
    const text = data.data;
    const uid = context.auth.uid;
    const timestamp = admin.firestore.Timestamp.now();
    const userRef = admin.firestore().collection("Users").doc(uid);
    return userRef.get().then(doc => {
        var amount = doc.get('uploadCounter') || 0;
        var lastUpload = doc.get('lastUpload') || null;

        if(amount === null || amount >= 2) {
            amount = 0;
        }
        else if(lastUpload === null || timestamp.seconds - lastUpload.seconds > 30 * 60) {
            amount = 0
        }
        else {
            const seconds = (30 * 60) - (timestamp.seconds - lastUpload.seconds);
            const timer = new Date(0,0,0,0,0,seconds,0);
            throw new functions.https.HttpsError("invalid-argument", "The amount of uploads for this account has exceeded the limit.  Try again in (" + timer.getMinutes() + ") minutes");
        }
        return userRef.set({uploadCounter: amount + 1, lastUpload: timestamp}, {merge: true})
    }).then(result => {
        return userRef.collection("uploads").doc().set({name: name, date: timestamp});
    }).catch(error => {
        console.error(error);
    });
});

exports.updateName = functions.https.onCall((data, context) => {
    const firstName = data.firstName;
    const lastName = data.lastName;

    return admin.auth().updateUser({
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
        throw new functions.gttps.HttpsError('invalid-argument', "Confirm your password");
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