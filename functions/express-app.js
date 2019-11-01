const express = require('express');
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
    const nav = ["home", "upload", "personal_information", "history", "settings"]
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

function getRandomColor(seed) {
    var letters = '0123456789ABCDEF';
    var color = '#';
    Math.seedrandom(seed);
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

function isLocalHost(host) {
    return host === "localhost";
}

exports.app = app;