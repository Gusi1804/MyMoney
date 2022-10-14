var express = require('express');
var router = express.Router();

var admin = require("firebase-admin");

var functions = require('./functions'); // Import custom functions

// Fetch the service account key JSON file contents
//var serviceAccount = require("/Users/gustavogarfias/Documents/Cybernetics Project Fall 22/MyMoney/mymoney-9e9c8-firebase-adminsdk-kfspr-8d10e3c3cc.json");

// NOTE: serviceAccount for public release!
var serviceAccount = require('/etc/secrets/serviceAccount.json'); 

// Initialize the app with a service account, granting admin privileges (this data will be used throughout all the code; the app just has to be initialized once)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // The database URL depends on the location of the database
  databaseURL: "https://mymoney-9e9c8-default-rtdb.firebaseio.com/"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database(); // Start Firebase Realtime Database object
var auth = admin.auth(); // Start Firebase Authentication object

// GET home page. Route: '/' //
router.get('/', function(req, res, next) {
  functions.auth(req, auth, (uid) => { // Authentication function
    // Successful authentication
    console.log(uid);

    var ref = db.ref("transactions"); // reference to all transactions within database
    ref.orderByChild("date").once("value", function(snapshot) { // Sort transactions by date (in Firebase backend), and get all documents within reference once
      console.log(snapshot.val());
      var data = snapshot.val();
      
      var count = 0;

      for (const trans_id in data) { // process data from backend
        const trans = data[trans_id];

        if (trans.uid == uid) { // only use this document (this transaction) if it has the same uid as the user's uid
          trans.amount_f = functions.format_currency(trans.amount); // Add formated amount to the object (for prettier visualization)
          trans.date_f = functions.format_date(trans.date); // Add formated date to the object (for prettier visualization)
          trans.id = trans_id; // add transaction id to the object

          data[trans_id] = trans; // Replace old object with the object with the new data

          count++; // count object
        }
      }

      data = functions.sort_transactions(data); // sort transactions by date. because as it was explained in Update 3, the backend function didn't work...

      if (count != 0) {
        res.render('index', { transactions: data , title: 'MyMoney'}); // render index.hbs with user's data
      } else {
        res.render('index', { title: "MyMoney" }); // render index.hbs without any transactions data
      }

      
    });
  }, (error) => {
    // Unsuccessful login, redirect to login page
    console.log(error);
    res.redirect('/login');
  });
});

module.exports = router;
