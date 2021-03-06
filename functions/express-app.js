const admin = require('firebase-admin');
const express = require('express');
const exphbs  = require('express-handlebars');
const firebaseUser = require('./user-request');
const fileUpload = require('busboy-firebase')
const Handlebars = require('handlebars');
const seed = require("./seedrandom");
const uploadFunction = require('./upload-function');

const app = express();
const handlebars = exphbs();

app.engine('handlebars', handlebars);
app.set('view engine', 'handlebars');
app.use(firebaseUser.validateFirebaseUser);

Handlebars.registerHelper('equals', (a, b, options) => {
    return (a === b) ? options.fn(options.data.root) : options.inverse(options.data.root);
});

Handlebars.registerHelper('mod2', (value, options) => {
    return (value % 2 === 0) ? options.fn(options.data.root) : options.inverse(options.data.root);
});
/**
 * Creates the GET handler for index
 */
app.get('/', (req,res) =>{
    if(req.user){
        res.render('index', 
        {
            layout: false, 
            localhost: isLocalHost(req.hostname),
            user: req.user,
            imgUrl: req.user.imgUrl || "/images/user.png",
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

/**
 * Creates the GET handler for account
 */
app.get('/account', async (req,res) =>{
    const nav = ["home", "upload", "personal_information", "history", "settings"]
    const userNav = req.query.navigation;
    if(req.user){
        const navigation = nav.includes(userNav) ? userNav : "home";
        let history = [];
        if(navigation === "history") {
            await getUserHistory(req.user.uid).then(data =>
            {
                history = data;
                return;
            }).catch(_ => {
                return;
            });
        }
        renderAccount(req, res, navigation, history, null);
    }
    else {
        res.redirect('/');
    }
});

/**
 * Creates the POST handler for account
 */
app.post('/account', fileUpload, async (req,res) => {
    if(req.user) {
        return getAllUploadPromises(req.files, req.user.uid)
        .then(promises => {
            return getAllUploadResults(promises);
        })
        .then(results => {
            return renderAccount(req, res, "upload", null, "Files were uploaded successfully");
        })
        .catch(error => {
            return renderAccount(req, res, "upload", null, error.message);
        })
    }
    else {
        return res.redirect('/');
    }
});

/**
 * Promise for Uploads
 * @param {File[]} files List of Files for Upload
 * @param {String} uid UID of User For Upload
 */
async function getAllUploadPromises(files, uid) {
    return new Promise((resolve, reject) => {
        promises = []
        for(let i = 0; i < files.length; i++) {
            fileObject = {filename: files[i].originalname, file: files[i].buffer}
            promises.push(uploadFunction.uploadFileToFirebaseAndIBM(fileObject, uid));
        }
        return resolve(promises);
    })
}

/**
 * Receives a list of Promises for uploading
 * @param {Promise[]} promises List of promises
 */
async function getAllUploadResults(promises) {
    return new Promise((resolve, reject) => {
        return Promise.all(promises)
        .then(async results => {
            return resolve(results);
        })
        .catch(err => {
            return reject(err);
        });
    })
}

/**
 * Renders the actual account page
 * @param {Request} req Request Object
 * @param {Response} res Response Object
 * @param {String} navigation 
 * @param {{filename:String, date:String}[]} history list of Objects with filename and date
 * @param {String} alert Alert message if any
 */
function renderAccount(req, res, navigation, history, alert) {
    res.render('account', {
        layout: false,
        localhost: isLocalHost(req.hostname),
        displayName: req.user.displayName,
        imgUrl: req.user.imgUrl || "/images/user.png",
        imgColor: req.user.imgUrl ? "#000000" : getRandomColor(req.user.uid),
        email: req.user.email,
        navigation: navigation,
        history: history,
        provider: req.user.providerData[0].providerId,
        alertMessage: alert,
    });
}

/**
 * Creates the GET handler for signin
 */
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

/**
 * Gets a random seeded color
 * @param {Object} seed random seed
 */
function getRandomColor(seed) {
    var letters = '0123456789ABCDEF';
    var color = '#';
    Math.seedrandom(seed);
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}
/**
 * Gets a users history
 * @param {String} uid users UID
 */
function getUserHistory(uid) {
    return admin.firestore().collection("Users").doc(uid).collection("history").orderBy("date", 'desc').get().then(query => {
        const data = [];
        query.forEach(doc => {
            const filename = doc.data().filename || 'unknown';
            const date = doc.data().date.toDate();
            console.log(date);
            const fData = {filename: filename, date: formatDate(date)};
            data.push(fData);
        });
        return data;
    }).catch(error => {
        return [];
    });
}

/**
 * modifies the Date to a more readable format
 * @param {Date} date The date
 */
function formatDate(date) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hour = date.getHours() % 12;
    const minute = ('0' + date.getMinutes()).slice(-2);
    const zone = Math.floor(date.getHours() / 12) === 0 ? 'AM' : 'PM';
    return month + ' ' + day + ', ' + year + ' at ' + hour + ':' + minute + ' ' + zone;
}

/**
 * Checks if the server is currently being hosted on localhost
 * @param {String} host ip address of server
 */
function isLocalHost(host) {
    return host === "localhost";
}

exports.app = app;