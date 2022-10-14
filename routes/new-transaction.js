var express = require('express');
var router = express.Router();

var admin = require("firebase-admin"); // Import firebase-admin module, used to connect to Firebase Backend for Firebase Realtime Database

var functions = require('./functions'); // Import custom functions

var db = admin.database(); //Start Firebase Realtime Database object
var auth = admin.auth(); // Start Firebase Authentication object

router.get('/', function(req, res, next) { //Webpage that is displayed in the route /new/transaction/ to create a new transaction (frontend code)
    functions.auth(req, auth, (uid) => { // Authentication function
        // Successful authentication
        let now_string = functions.date_to_form_string(new Date()); /*Get a formatted string that can be passed as an input to the New Transaction page, in order to automatically display
        the current time (I think it's easier for users that want to register transactions immediately after they happen) */
        
        // Load accounts, projects and categories of the user, which will be passed as a parameter to the handlebars file to show them dynamically (i.e., the user will have to option to select only their already created accounts, projects, and categories)
        db.ref(`accounts`).orderByChild("uid").equalTo(uid).once("value", function(snapshot) {
            var accounts = snapshot.val(); // save accounts to the variable accounts
            
            db.ref(`projects`).orderByChild("uid").equalTo(uid).once("value", function(snapshot) {
                var projects = snapshot.val(); // save accounts to the variable accounts

                db.ref(`categories`).orderByChild("uid").equalTo(uid).once("value", function(snapshot) {
                    var categories = snapshot.val(); // save accounts to the variable accounts
                    
                    res.render('new-transaction', { title: 'New Transaction', now: now_string, accounts: accounts, projects: projects, categories: categories }); //Render New Transaction page with user's data
                });            
            });
        });
    }, () => {
        // Unsuccessful login, redirect to login page
        res.redirect('/login');
    });
});

router.post('/', (req, res) => { //Backend code to process the POST requests to create new transactions
    functions.auth(req, auth, (uid) => {
        var date_millis = functions.date_to_millis(new Date(req.body.date)); //Convert date input to millseconds since EPOCH

        const newTransaction = { //Create new transaction JavaScript object, that essentially works like JSON; therefore it can be directly pushed to Firebase Realtime Database
            item: req.body.item,
            merchant: req.body.merchant,
            amount: functions.currency_to_float(req.body.amount),
            project: req.body.project,
            category: req.body.category,
            type: req.body.type,
            account: req.body.account,
            date: date_millis,
            uid: uid
        };

        db.ref('transactions').push(newTransaction); //Push transaction object to Firebase Realtime Database in the transactions route

        const amount = functions.currency_to_float(req.body.amount); // convert user's input amount to a float, saved in the amount constante

        functions.update_balance(req.body.account, uid, amount, admin); // update account's balance by adding transaction's amount
        functions.update_cat_balance(req.body.category, uid, amount, admin); // update category's balance by adding transaction's amount
        functions.update_proj_balance(req.body.project, uid, amount, admin); // update project's balance by adding transaction's amount

        res.redirect('/'); //Redirect to homepage to see newly added transaction
    }, () => {
        // Unsuccessful login, redirect to login page
        res.redirect('/login');
    });
    
});

module.exports = router;