var express = require('express');
var router = express.Router();

//var admin = require("firebase-admin"); // Import firebase-admin module, used to connect to Firebase Backend for Firebase Realtime Database

//var functions = require('./functions'); // Import custom functions

//var db = admin.database(); // Start Firebase Realtime Database object

router.get('/', (req, res) => { // Backend code to process requests to delete transactions
    res.render('login', { title: "Login" });
});

module.exports = router;