const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const exphbs  = require('express-handlebars');
const Handlebars = require('handlebars');
const serviceAccount = require("./ibmcsa-b542b-firebase-adminsdk-wmqg6-4667a6f3f7");
const firebaseUser = require('./firebaseUser');
const seed = require("./seedrandom");

const app = express();
const handlebars = exphbs();

app.engine('handlebars', handlebars);
app.set('view engine', 'handlebars');
app.use(firebaseUser.validateFirebaseIdToken);

Handlebars.registerHelper('equals', (a, b, options) => {
    return (a === b) ? options.fn(options.data.root) : options.inverse(options.data.root);
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ibmcsa-b542b.firebaseio.com"
});

app.get('/', (req,res) =>{
    if(req.user){
        res.render('index', 
        {
            layout: false, 
            localhost: isLocalHost(req.hostname),
            user: req.user,
            imgUrl: req.user.imgUrl || "images/user.png",
            imgColor: req.user.imgUrl ? "#000000" : getRandomColor(req.user.uid),
            displayName: req.user.displayName,
            email: req.user.email,
        });
    }
    else {
        res.render('index', 
        {
            layout: false,
            user: null,
        });
    }
});

app.get('/account', (req,res) =>{
    const nav = ["home", "personal_information", "security", "history", "settings"]
    const userNav = req.query.navigation;
    if(req.user){
        res.render('account', 
        {
            layout: false,
            localhost: isLocalHost(req.hostname),
            displayName: req.user.displayName,
            imgUrl: req.user.imgUrl || "images/user.png",
            imgColor: req.user.imgUrl ? "#000000" : getRandomColor(req.user.uid),
            email: req.user.email,
            navigation: nav.includes(userNav) ? userNav : "home",
        });
    }
    else {
        res.redirect('/');
    }
});

app.get('/signin', (req,res) =>{
    const nav = ["login", "register"]
    const userNav = req.query.navigation;
    if(!req.user){
        res.render('signin', 
        {
            layout: false,
            localhost: isLocalHost(req.hostname),
            navigation: nav.includes(userNav) ? userNav : "login",
        });
    }
    else {
        res.redirect('/');
    }
});

exports.app = functions.https.onRequest(app);

exports.getUserFiles = functions.https.onCall((data, context) => {
    return admin.firestore().collection('Users').doc(context.auth.uid).collection('uploads').get()
    .then(snapshot => {
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
    return userRef.get()
    .then(doc => {
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
    })
    .then(result => {
        return userRef.collection("uploads").doc().set({name: name, date: timestamp});
    })
    .catch(error => {
        console.error(error);
    });
});

exports.updateName = functions.https.onCall((data, context) => {
    const firstName = data.firstName;
    const lastName = data.lastName;

    return admin.auth().updateUser({
        displayName: firstName + ' ' + lastName
    })
    .then((user) => {
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

    return admin.auth().updateUser({
        password: password
    })
    .then((user) => {
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

function getRandomColor(seed) {
    var letters = '0123456789ABCDEF';
    var color = '#';
    Math.seedrandom(seed);
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function isLocalHost(host) {
    return host === "localhost";
}