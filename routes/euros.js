/**
 * Created by Charlie on 12/01/2017.
 */
var express = require('express');
var request = require('request');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var userDB = database.ref().child('users');

/**
 * Créer une bill pour un projet
 */
router.post('/bills', function(req, res){
    //var id = "testcharlie1";
    //var payerTab = ["1234567", "456798"];
    var payerTab = req.body.payerTab;
    var id = req.body.id.replace(/-|_/g, "").toLowerCase();
    var payerUid = req.body.uid;
    var prix = req.body.prix;
    var what = req.body.what;
    var auth = {
        'user': id,
        'pass': id
    };

    request.get({url:'https://ihatemoney.org/api/projects/'+id,
            'auth': auth
        },
        function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            var project = JSON.parse(body);
            var members = project["members"];
            var idpayer = null;
            var payerfor = [];
            if(members.length > 0){
                for(var i = 0; i < members.length; i++){
                    if(payerUid == members[i].name){
                        idpayer = members[i].id;
                    }
                    var num = payerTab.indexOf(members[i].name);
                    if(num > -1){
                        payerfor.push(members[i].id);
                    }
                }
            }
            if(idpayer == null)
                res.send({message : "payer null"});
            if(payerfor.length == 0)
                res.send({message : "payerfor null"});

            var bill = {
                "what" : what,
                "payer" : idpayer,
                "payed_for" : payerfor,
                "amount" : prix
            };
            request.post({url:'https://ihatemoney.org/api/projects/'+id+'/bills', formData: bill,
                'auth': auth
            }, function optionalCallback(err, httpResponse, body) {
                if (err) {
                    return console.error('upload failed:', err);
                }
                console.log('Successful!  Server responded with:', body);
                res.send({message : "OK"});
            });
        });

});

/**
 * Lister les bills d'un projet et le projet
 */
router.get('/:id/bills', function(req, res){
    var id = req.params.id;
    id = id.replace(/-|_/g, "").toLowerCase();
    var auth = {
        'user': id,
        'pass': id
    };

    // Récupère tous les users
    userDB.once("value", function(users){
        var all_users = users.val();
        // Récupère le projet
        request.get('https://ihatemoney.org/api/projects/'+id, {
            'auth': auth
        },function optionalCallback(err, httpResponse, body2) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Successful!  GET PROJET:', body2);
            var r  = JSON.parse(body2);

            // Récupère toutes les factures
            request.get('https://ihatemoney.org/api/projects/'+id+'/bills', {
                'auth': auth
            },function optionalCallback(err, httpResponse, bills) {
                if (err) {
                    return console.error('upload failed:', err);
                }

                // Bills
                console.log('Successful! GET BILLS', bills);
                var all_bills = JSON.parse(bills);

                if(all_bills.length >0){
                    for(var i = 0 ; i < all_bills.length; i++){
                        var tabUserBills = [];
                        var owers = all_bills[i].owers;
                        var payerId = all_bills[i].payer_id;
                        // Récupére les payeur for
                        if(owers.length > 0){
                            for(var j = 0; j < owers.length; j++){
                                var uidUser = owers[j].name;
                                if(all_users[uidUser]){
                                    tabUserBills.push(all_users[uidUser]);
                                }
                            }
                            all_bills[i].owers = tabUserBills;
                        }
                        // Récupérer le payeur
                        var members = r["members"];
                        for(var m= 0; m < members.length ; m++){
                            if(members[m].id == payerId){
                                var user = all_users[members[m].name];
                                all_bills[i].payer_id = user;
                                break;
                             }
                        }
                    }
                }

                // Balances
                var tabUser = [];
                if(r['balance']){
                    var tabId = [];
                    var tabBal = [];
                    Object.keys(r['balance']).forEach(function(nb){
                        tabId.push(nb);
                        tabBal.push(r.balance[nb]);
                    });

                    // Récupérer les membres
                    var members2 = r["members"];
                    for(var id = 0 ; id < tabId.length ; id++){
                        for(var m2= 0; m2 < members2.length ; m2++){
                            if(members2[m2].id == tabId[id]){
                                var user2 = all_users[members2[m2].name];
                                user2['balance'] = tabBal[id];
                                tabUser.push(user2);
                            }
                        }
                    }
                }
                var result = {
                    "balances" : tabUser,
                    "depenses" : all_bills
                };
                res.send(result);
            });

        });
    });
});

/**
 * Supprimer une bill
 */
router.delete('/:id/bills/:idb', function(req, res){

    var id = req.params.id;
    var idb = req.params.idb;

    id = id.replace(/-|_/g, "").toLowerCase();
    console.log(id);

    request.delete('https://ihatemoney.org/api/projects/'+id+'/bills/'+idb, {
        'auth': {
            'user': id,
            'pass': id
        }
    },function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Successful!  Server responded with:', body);
        res.send({message : "OK"});
    });
});

module.exports = router;