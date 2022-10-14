var express = require('express');
var router = express.Router();

var admin = require("firebase-admin"); // Import firebase-admin module, used to connect to Firebase Backend for Firebase Realtime Database

var functions = require('./functions'); // Import custom functions

var db = admin.database(); // Start Firebase Realtime Database object
var auth = admin.auth(); // Start Firebase Authentication object

// GENERAL NOTE: the requests are done through get requests, because the delete buttons are links to a /delete/{object type to remove, e.g. transaction, project, etc.}/{transaction id}; when trying to load a webpage, a GET request is done

router.get('/transaction/:id', (req, res) => { // Backend code to process requests to delete transactions
    functions.auth(req, auth, (uid) => { // Authentication function
        // Successful authentication
        const id = req.params.id; // Transaction id

        db.ref(`transactions/${id}`).once("value", function(snapshot) { // Reference to transaction within database; get document once
            var data = snapshot.val();
            
            functions.update_balance(data.account, uid, -1 * data.amount, admin); // Update account balance by subtracting transaction's amount
            functions.update_cat_balance(data.category, uid, -1 * data.amount, admin); // Update category balance by subtracting transaction's amount
            functions.update_proj_balance(data.project, uid, -1 * data.amount, admin); // Update project balance by subtracting transaction's amount
            db.ref(`transactions/${id}`).remove(); // Remove transaction from database

            res.redirect('/'); // Redirect to updated homepage
        });
    }, () => {
        // Unsuccessful authentication, redirect to login page
        res.redirect('/login');
    });
});

router.get('/category/:id', (req, res) => { // Backend code to process requests to delete categories
    functions.auth(req, auth, (uid) => { // Authentication function
        // Successful authentication
        const id = req.params.id; // Category id

        db.ref(`categories/${id}`).remove(); // Remove category from database
        res.redirect('/'); // Redirect to updated homepage
    }, () => {
        // Unsuccessful authentication, redirect to login page
        res.redirect('/login');
    });
});

router.get('/project/:id', (req, res) => { // Backend code to process requests to delete projects
    functions.auth(req, auth, (uid) => { // Authentication function
        // Successful authentication
        const id = req.params.id; // Project id

        db.ref(`projects/${id}`).remove(); // Remove project from database
        res.redirect('/'); // Redirect to updated homepage
    }, () => {
        // Unsuccessful authentication, redirect to login page
        res.redirect('/login');
    });
});

router.get('/account/:id', (req, res) => { // Backend code to process requests to delete accounts
    functions.auth(req, auth, (uid) => { // Authentication function
        // Successful authentication
        const id = req.params.id; // Account id

        db.ref(`accounts/${id}`).remove(); // Remove account from database
        res.redirect('/'); // Redirect to updated homepage
    }, () => {
        // Unsuccessful authentication, redirect to login page
        res.redirect('/login');
    });
});

module.exports = router;