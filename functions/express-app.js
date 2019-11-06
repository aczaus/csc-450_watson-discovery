const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const formidable = require('formidable')
const exphbs  = require('express-handlebars');
const firebaseUser = require('./firebaseUser');
const Handlebars = require('handlebars');
const seed = require("./seedrandom");

const app = express();
const handlebars = exphbs();

app.engine('handlebars', handlebars);
app.set('view engine', 'handlebars');
app.use(firebaseUser.validateFirebaseIdToken); 

Handlebars.registerHelper('equals', (a, b, options) => {
    return (a === b) ? options.fn(options.data.root) : options.inverse(options.data.root);
});

Handlebars.registerHelper('mod2', (value, options) => {
    return (value % 2 === 0) ? options.fn(options.data.root) : options.inverse(options.data.root);
});

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
            }).catch(error => {
                return;
            });
        }
        res.render('account', 
        {
            layout: false,
            localhost: isLocalHost(req.hostname),
            displayName: req.user.displayName,
            imgUrl: req.user.imgUrl || "/images/user.png",
            imgColor: req.user.imgUrl ? "#000000" : getRandomColor(req.user.uid),
            email: req.user.email,
            navigation: navigation,
            history: history,
            provider: req.user.providerData[0].providerId,
        });
    }
    else {
        res.redirect('/');
    }
});

app.post('/account', (req,res) => {
    
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

function getRandomColor(seed) {
    var letters = '0123456789ABCDEF';
    var color = '#';
    Math.seedrandom(seed);
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

function getUserHistory(uid) {
    console.log("GET USER HISTORY")
    return admin.firestore().collection("Users").doc(uid).collection("history").orderBy("date").get().then(query => {
        const data = [];
        query.forEach(doc => {
            const date = doc.data().date.toDate();
            const fData = {date: formatDate(date)};
            data.push(fData);
        });
        return data;
    }).catch(error => {
        return [];
    });
}

function formatDate(date) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hour = date.getHours() % 12;
    const minute = date.getMinutes();
    const zone = Math.floor(date.getHours() / 12) === 0 ? 'AM' : 'PM';
    return month + ' ' + day + ', ' + year + ' at ' + hour + ':' + minute + ' ' + zone;
}

function isLocalHost(host) {
    return host === "localhost";
}

exports.app = app;