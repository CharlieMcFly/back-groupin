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
 * Récupérer un projet => renvoie les users et leur balance
 */
router.get('/:id', function(req, res){

    var id = req.params.id;
    var key = id.replace(/-|_/g,'').toLowerCase();
    var auth= {'user': key, 'pass': key};

    userDB.once('value', function(users){
       var all_users = users.val();
        request.get('https://ihatemoney.org/api/projects/'+key, {
            'auth': {
                'user': key,
                'pass': key
            }
        },function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Successful!  Server responded with:', body);
            var r  = JSON.parse(body);
            var tabUser = [];
            if(r['balance']){

                var tabId = [];
                var tabBal = [];
                Object.keys(r['balance']).forEach(function(nb){
                    tabId.push(nb);
                    tabBal.push(r.balance[nb]);
                });

                var members = r["members"];
                for(var id = 0 ; id < tabId.length ; id++){
                    for(var m= 0; m < members.length ; m++){
                        if(members[m].id == tabId[id]){
                            var user = all_users[members[m].name];
                            user['balance'] = tabBal[id];
                            tabUser.push(user);
                        }
                    }
                }
            }
            res.send(tabUser);
        });

    });

});

/**
 * Créer une bill pour un projet
 */
router.post('/bills', function(req, res){
    var id = req.body.id.replace(/-|_/g, "");
    var payer = req.body.uid;

    var bill = {
        "what" : req.body.what,
        "payer" : "3815", /* ID de l'utilisateur sur Ihatemoney */
        "payed_for" : "3816", /* Multiplier l'url pour plusieurs personne */
        "amount" : "15"
    };
    request.post({url:'https://ihatemoney.org/api/projects/'+id+'/bills', formData: bill,
        'auth': {
            'user': id,
            'pass': id
        }
    }, function optionalCallback(err, httpResponse, body) {
        if (err) {
            console.error('upload failed:', err);
            res.sendStatus(500);
        }
        console.log('Successful!  Server responded with:', body);
        res.send(body);
    });
});

/**
 * Lister les bills d'un projet
 */
router.get('/:id/bills', function(req, res){
    var id = req.params.id;
    id = id.replace(/-|_/g, "").toLowerCase();

    request.get('https://ihatemoney.org/api/projects/'+id+'/bills', {
            'auth': {
                'user': id,
                'pass': id
            }
        },function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Successful!  Server responded with:', body);
            res.send(JSON.parse(body));
    });
});

/**
 * Supprimer une bill
 */
router.delete('/:id/bills/:idb', function(req, res){
   //var id = req.params.id;
   //var idb = req.params.id;
   var id = "testcharlie1";
   var idb = "21595";

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
        res.send(body);
    });
});

module.exports = router;