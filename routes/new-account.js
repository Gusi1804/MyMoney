var express = require('express');
var router = express.Router();

var admin = require("firebase-admin"); // Import firebase-admin module, used to connect to Firebase Backend for Firebase Realtime Database

var functions = require('./functions');

var db = admin.database(); //Start Firebase Realtime Database object
var auth = admin.auth();

router.get('/', function(req, res, next) { //Webpage that is displayed in the route /new/account/ to create a new transaction (frontend code)
    res.render('new-account', { title: 'New Account'}); //Render New Account page
});

router.post('/', (req, res) => { //Backend code to process the POST requests to create new transactions
    functions.auth(req, auth, (uid) => {
        const newAccount = { //Create new transaction JavaScript object, that essentially works like JSON; therefore it can be directly pushed to Firebase Realtime Database
            name: req.body.name,
            balance: functions.currency_to_float(req.body.balance),
            type: req.body.type,
            uid: uid
        };
    
        db.ref('accounts').push(newAccount); //Push transaction object to Firebase Realtime Database
    
        res.redirect('/accounts'); //Redirect to homepage to see newly added account;
    }, () => {
        res.redirect('/login');
    }); 
});

module.exports = router;