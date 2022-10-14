var express = require('express');
var router = express.Router();

var admin = require("firebase-admin"); // Import firebase-admin module, used to connect to Firebase Backend for Firebase Realtime Database

var functions = require('./functions'); // Import custom functions module

var db = admin.database(); // Start Firebase Realtime Database object
var auth = admin.auth(); // Start Firebase Authentication object

router.get('/', function(req, res, next) { // Webpage that is displayed in the route /accounts/ to view all accounts (frontend code)
    functions.auth(req, auth, (uid) => { // Authentication function
        // Successful authentication
        var ref = db.ref("accounts").orderByChild('uid').equalTo(uid); // Reference to all accounts with the same uuid as that of the current user
        ref.once("value", function(snapshot) { // Get all documents in the reference ONCE
            console.log(snapshot.val());
            var data = snapshot.val();

            for (const acc_id in data) { // Process data: add account id and formatted balance to the account object
                const acc = data[acc_id];
        
                acc.balance_f = functions.format_currency(acc.balance); // Add formated balance to the object (for prettier visualization)
                acc.id = acc_id; // Add account id to the object
        
                data[acc_id] = acc; // Replace old object with the object with the new data
            }

            res.render('accounts', { accounts: data , title: 'Accounts'}); // Render accounts.hbs with the user's data
        });
    }, () => {
        // Unsuccessful authentication; redirected to login page (NOTE: this may happen not only because the user is not logged in, but also if the user's saved login toke has expired)
        res.redirect('/login');
    });
});

router.get('/:id', function(req, res) { // Webpage that is displayed in the route /accounts/{account id} to view a specific account (frontend code)
    functions.auth(req, auth, (uid) => { // Authentication function
        // Successful authentication
        const id = req.params.id; // Account id
        console.log(`Loading account with id ${id}`);

        db.ref(`accounts/${id}`).once("value", function(snapshot) { // Reference to the account within the database
            var data = snapshot.val();
            console.log(data);
            let account = data.name; // account name

            console.log(`Account: ${account}`);
            
            db.ref("transactions").orderByChild('uid').equalTo(uid).once("value", function(snapshot) { // Reference to the user's transactions with the same uuid as that of the current user, get them once 
                //console.log(snapshot.val());
                var data = snapshot.val();
                var account_data = new Object();

                var count = 0;
        
                for (const trans_id in data) { // Process data from backend
                    const trans = data[trans_id];
                    console.log(trans.account);
                    
                    if (trans.account == account) { // Only show transactions in the frontend which have the same account name as the account which is trying to be visualized
                        trans.amount_f = functions.format_currency(trans.amount); // Add formated amount to the object (for prettier visualization)
                        trans.date_f = functions.format_date(trans.date); // Add formated date to the object (for prettier visualization)
                        trans.id = trans_id; // Add transaction id to the object
                
                        account_data[trans_id] = trans; // Replace old object with the object with the new data

                        count++; // Count object
                    }
                }

                account_data = functions.sort_transactions(account_data); // Sort transactions by date
                
                if (count != 0) {
                    res.render('index', { transactions: account_data , title: account}); // Render index.hbs; only send transactions object only if there are any transactions
                } else {
                    res.render('index', { title: account }); // Render index without transactions object (reasoning explained in index.hbs)
                }
            });
        });
    }, () => {
        // Unsuccessful authentication, redirect to login page
        res.redirect('/login')
    });

    
});

module.exports = router;