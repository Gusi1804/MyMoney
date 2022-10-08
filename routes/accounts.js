var express = require('express');
var router = express.Router();

var admin = require("firebase-admin"); // Import firebase-admin module, used to connect to Firebase Backend for Firebase Realtime Database

var functions = require('./functions');

var db = admin.database(); // Start Firebase Realtime Database object

router.get('/', function(req, res, next) { // Webpage that is displayed in the route /accounts/ to view all accounts (frontend code)
    var ref = db.ref("accounts");
    ref.once("value", function(snapshot) {
        console.log(snapshot.val());
        var data = snapshot.val();

        for (const acc_id in data) {
            const acc = data[acc_id];
      
            acc.balance_f = functions.format_currency(acc.balance);
            acc.id = acc_id;
      
            data[acc_id] = acc;
        }

        res.render('accounts', { accounts: data , title: 'Accounts'});
    });
});

router.get('/:id', function(req, res) {
    const id = req.params.id;
    console.log(`Loading account with id ${id}`);
    let uid = "0000001";

    db.ref(`accounts/${id}`).once("value", function(snapshot) {
        var data = snapshot.val();
        console.log(data);
        let account = data.name;

        console.log(`Account: ${account}`);
        //functions.update_balance(account, uid, 100, admin);
        
        db.ref("transactions").orderByChild('uid').equalTo(uid).once("value", function(snapshot) {
            //console.log(snapshot.val());
            var data = snapshot.val();
            var account_data = new Object();

            var count = 0;
    
            for (const trans_id in data) {
                const trans = data[trans_id];
                console.log(trans.account);
                
                if (trans.account == account) {
                    trans.amount_f = functions.format_currency(trans.amount);
                    //const fecha_pre = new Date(trans.date);
                    //console.log(fecha_pre);
                    //trans.date_f = fecha_pre.toLocaleString('es-MX');
                    trans.date_f = functions.format_date(trans.date);
                    trans.id = trans_id;
            
                    account_data[trans_id] = trans;

                    count++;
                }
            }

            account_data = functions.sort_transactions(account_data);
            
            if (count != 0) {
                res.render('index', { transactions: account_data , title: account});
            } else {
                res.render('index', { title: account });
            }
        });
    });
});

/*
router.post('/', (req, res) => { //Backend code to process the POST requests to create new transactions
    const newAccount = { //Create new transaction JavaScript object, that essentially works like JSON; therefore it can be directly pushed to Firebase Realtime Database
        name: req.body.name,
        balance: functions.currency_to_float(req.body.balance),
        type: req.body.type,
        uid: req.body.uid
    };

    db.ref('accounts').push(newAccount); //Push transaction object to Firebase Realtime Database

    // NOTE: still need to create /accounts page
    res.redirect('/accounts'); //Redirect to homepage to see newly added account;
});
*/

module.exports = router;