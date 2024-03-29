var express = require('express');
var router = express.Router();

var admin = require("firebase-admin"); // Import firebase-admin module, used to connect to Firebase Backend for Firebase Realtime Database

var functions = require('./functions'); // Import custom functions module

var db = admin.database(); //Start Firebase Realtime Database object
var auth = admin.auth(); // Start Firebase Authentication object

router.get('/', function(req, res, next) { //Webpage that is displayed in the route /new/category/ to create a new project (frontend code)
    res.render('new-category', { title: 'New Category'}); //Render New Category page
});

router.post('/', (req, res) => { //Backend code to process the POST requests to create new categories
    functions.auth(req, auth, (uid) => { // Authentication function
        // Successful authentication
        const newCategory = { //Create new project JavaScript object, that essentially works like JSON; therefore it can be directly pushed to Firebase Realtime Database
            name: req.body.name,
            balance: 0,
            uid: uid
        };
    
        db.ref('categories').push(newCategory); //Push transaction object to Firebase Realtime Database in the categories route
    
        res.redirect('/categories'); //Redirect to homepage to see newly added category;
    }, () => {
        // Unsuccessful login, redirect to login page
        res.redirect('/login');
    });
});

module.exports = router;