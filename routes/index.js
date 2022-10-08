var express = require('express');
var router = express.Router();

var admin = require("firebase-admin");

var functions = require('./functions'); // Import custom functions

// Fetch the service account key JSON file contents
//var serviceAccount = require("/Users/gustavogarfias/Documents/Cybernetics Project Fall 22/MyMoney/mymoney-9e9c8-firebase-adminsdk-kfspr-8d10e3c3cc.json");
var serviceAccount = process.env.serviceAccount;

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // The database URL depends on the location of the database
  databaseURL: "https://mymoney-9e9c8-default-rtdb.firebaseio.com/"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();

/* GET home page. */
router.get('/', function(req, res, next) {
  var ref = db.ref("transactions");
  ref.orderByChild("date").limitToFirst(10).once("value", function(snapshot) {
    console.log(snapshot.val());
    var data = snapshot.val();
    
    var count = 0;

    for (const trans_id in data) {
      const trans = data[trans_id];

      trans.amount_f = functions.format_currency(trans.amount);
      //const fecha_pre = new Date(trans.date);
      //console.log(fecha_pre);
      //trans.date_f = fecha_pre.toLocaleString('es-MX');
      trans.date_f = functions.format_date(trans.date);
      trans.id = trans_id;

      data[trans_id] = trans;

      count++;
    }

    data = functions.sort_transactions(data);

    if (count != 0) {
      res.render('index', { transactions: data , title: 'MyMoney'});
    } else {
      res.render('index', { title: "MyMoney" });
    }

    
  });
  
});

module.exports = router;
