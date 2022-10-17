var express = require('express');
var router = express.Router();

var admin = require("firebase-admin"); // Import firebase-admin module, used to connect to Firebase Backend for Firebase Realtime Database

var functions = require('./functions'); // Import custom functions module

var db = admin.database(); //Start Firebase Realtime Database object
var auth = admin.auth(); 

router.get('/', function(req, res, next) { //Webpage that is displayed in the route /categories/ to view all projects (frontend code)
    functions.auth(req, auth, (uid) => { // Authentication function
        // Successful authentication
        var ref = db.ref("categories").orderByChild('uid').equalTo(uid); // Reference to all categories with the same uid as that of the current user
        ref.once("value", function(snapshot) { // Get all documents in the reference ONCE
            var data = snapshot.val();

            for (const cat_id in data) { // Process data: add category id and formatted balance to the account object
                const cat = data[cat_id];
        
                cat.balance_f = functions.format_currency(cat.balance); // Add formated balance to the object (for prettier visualization)
                cat.id = cat_id; // Add category id to the object
        
                data[cat_id] = cat; // Replace old object with the object with the new data
            }

            res.render('categories', { categories: data , title: 'Categories'}); // Render categories.hbs with user data
        });
    }, () => {
        // Unsuccessful login, redirect to login page
        res.redirect('/login');
    });
});

router.get('/:id', function(req, res) {
    functions.auth(req, auth, (uid) => { // Authentication function
        // Successful authentication
        const id = req.params.id; // Category id
        console.log(`Loading category with id ${id}`);

        db.ref(`categories/${id}`).once("value", function(snapshot) { // Reference to the category within the database
            var data = snapshot.val();
            console.log(data);
            let category = data.name; // Category name

            console.log(`Category: ${category}`);
            
            db.ref("transactions").orderByChild('uid').equalTo(uid).once("value", function(snapshot) { // Reference to the user's transactions with the same uid as that of the current user, get them once
                //console.log(snapshot.val());
                var data = snapshot.val();
                var account_data = new Object();

                var count = 0;
        
                for (const trans_id in data) { // Process transactions
                    const trans = data[trans_id];
                    console.log(trans.account);
                    
                    if (trans.category == category) { // Only show transactions in the frontend which have the same category name as the account which is trying to be visualized
                        trans.amount_f = functions.format_currency(trans.amount); // Add formated amount to the object (for prettier visualization)
                        trans.date_f = functions.format_date(trans.date);  // Add formated date to the object (for prettier visualization)
                        trans.id = trans_id; // Add transaction id to the object
                
                        account_data[trans_id] = trans; // Replace old object with the object with the new data

                        count++; // Count object
                    }
                }

                account_data = functions.sort_transactions(account_data); // Sort transactions by date
                
                if (count != 0) {
                    res.render('index', { transactions: account_data , title: category }); // Render index.hbs; only send transactions object only if there are any transactions
                } else {
                    res.render('index', { title: category }); // Render index without transactions object (reasoning explained in index.hbs)
                }
            });
        });
    }, () => {
        // Render index without transactions object (reasoning explained in index.hbs)
        res.redirect('/login');
    });
});

module.exports = router;