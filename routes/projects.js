var express = require('express');
var router = express.Router();

var admin = require("firebase-admin"); // Import firebase-admin module, used to connect to Firebase Backend for Firebase Realtime Database

var functions = require('./functions');

var db = admin.database(); //Start Firebase Realtime Database object

router.get('/', function(req, res, next) { //Webpage that is displayed in the route /projects/ to view all projects (frontend code)
    var ref = db.ref("projects");
    ref.once("value", function(snapshot) {
        var data = snapshot.val();

        res.render('projects', { projects: data , title: 'Projects'});
    });
});

router.get('/:id', function(req, res) {
    const id = req.params.id;
    console.log(`Loading project with id ${id}`);
    let uid = "0000001";

    db.ref(`projects/${id}`).once("value", function(snapshot) {
        var data = snapshot.val();
        console.log(data);
        let project = data.name;

        console.log(`Project: ${project}`);
        
        db.ref("transactions").orderByChild('uid').equalTo(uid).once("value", function(snapshot) {
            //console.log(snapshot.val());
            var data = snapshot.val();
            var account_data = new Object();

            var count = 0;
    
            for (const trans_id in data) {
                const trans = data[trans_id];
                console.log(trans.account);
                
                if (trans.project == project) {
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
                res.render('index', { transactions: account_data , title: project});
            } else {
                res.render('index', { title: project });
            }
        });
    });
});

module.exports = router;