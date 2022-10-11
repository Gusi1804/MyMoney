var express = require('express');
var router = express.Router();

var admin = require("firebase-admin"); // Import firebase-admin module, used to connect to Firebase Backend for Firebase Realtime Database

var functions = require('./functions');

var db = admin.database(); //Start Firebase Realtime Database object
var auth = admin.auth();

router.get('/', function(req, res, next) { //Webpage that is displayed in the route /new/project/ to create a new project (frontend code)
    res.render('new-project', { title: 'New Project'}); //Render New Project page
});

router.post('/', (req, res) => { //Backend code to process the POST requests to create new projects
    functions.auth(req, auth, (uid) => {
        const newProject = { //Create new project JavaScript object, that essentially works like JSON; therefore it can be directly pushed to Firebase Realtime Database
            name: req.body.name,
            balance: 0,
            uid: uid
        };
    
        db.ref('projects').push(newProject); //Push transaction object to Firebase Realtime Database
    
        res.redirect('/projects'); //Redirect to homepage to see newly added project;
    }, () => {
        res.redirect('/login');
    });
});

module.exports = router;