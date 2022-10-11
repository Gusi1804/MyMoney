var express = require('express');
var router = express.Router();

var admin = require("firebase-admin"); // Import firebase-admin module, used to connect to Firebase Backend for Firebase Realtime Database

var functions = require('./functions'); // Import custom functions

var db = admin.database(); // Start Firebase Realtime Database object
var auth = admin.auth();

router.get('/transaction/:id', (req, res) => { // Backend code to process requests to delete transactions
    functions.auth(req, auth, (uid) => {
        const id = req.params.id;
        //console.log(id);

        db.ref(`transactions/${id}`).once("value", function(snapshot) {
            var data = snapshot.val();
            
            functions.update_balance(data.account, uid, -1 * data.amount, admin);
            functions.update_cat_balance(data.category, uid, -1 * data.amount, admin);
            functions.update_proj_balance(data.project, uid, -1 * data.amount, admin);
            db.ref(`transactions/${req.params.id}`).remove();

            res.redirect('/'); // Redirect to updated homepage
        });
    }, () => {
        res.redirect('/login');
    });
});

router.get('/category/:id', (req, res) => { // Backend code to process requests to delete categories
    functions.auth(req, auth, (uid) => {
        const id = req.params.id;
        //console.log(id);

        db.ref(`categories/${req.params.id}`).remove();
        res.redirect('/'); // Redirect to updated homepage
    }, () => {
        res.redirect('/login');
    });
});

router.get('/project/:id', (req, res) => { // Backend code to process requests to delete projects
    functions.auth(req, auth, (uid) => {
        const id = req.params.id;
        //console.log(id);

        db.ref(`projects/${req.params.id}`).remove();
        res.redirect('/'); // Redirect to updated homepage
    }, () => {
        res.redirect('/login');
    });
});

router.get('/account/:id', (req, res) => { // Backend code to process requests to delete accounts
    functions.auth(req, auth, (uid) => {
        const id = req.params.id;
        //console.log(id);

        db.ref(`accounts/${req.params.id}`).remove();
        res.redirect('/'); // Redirect to updated homepage
    }, () => {
        res.redirect('/login');
    });
});

module.exports = router;