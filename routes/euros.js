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
 * Creer un groupe de dépense
 */
router.post('/', function(req, res){
    /*var params = {
        "name" : req.body.name,
        "id" : req.body.id,
        "pwd" : req.body.pwd,
        "contact_email" : req.body.contact
    };*/
    var params = {
        "name" : "testcharlie1",
        "id" : "testcharlie1",
        "password" : "testcharlie1",
        "contact_email" : "cquetstroey@hotmail.fr"
    };
    request.post({url:'https://ihatemoney.org/api/projects', formData: params}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Successful!  Server responded with:', body);
        res.send(body);
    });



});

/**
 * Récupérer un projet
 */
router.get('/:id', function(req, res){

    /*var id = req.params.id;*/
    var id = "testcharlie1";

    request.get('https://ihatemoney.org/api/projects/'+id, {
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

/**
 * Supprimer un projet
 */
router.delete('/:id', function(req, res){
    /*var id = req.params.id;*/
    var id = "testcharlie1";

    request.delete('https://ihatemoney.org/api/projects/'+id, {
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

/**
 * Ajouter un membre au projet
 */
router.post('/members', function(req, res){
    //var uid = req.body.uid;
    //var id = req.body.id;
    var id = "testcharlie1";
    var uid = "456798";
    var params = {
        "name" : uid
    };
    request.post({url:'https://ihatemoney.org/api/projects/'+id+'/members', formData: params,
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
 * Supprimer un membre au projet
 */
router.delete('/:id/members/:uid', function(req, res){
    //var uid = req.params.uid;
    //var id = req.params.id;
    var id = "testcharlie1";
    var uid = "123456";
    request.get({url:'https://ihatemoney.org/api/projects/'+id+'/members',
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
        var b = JSON.parse(body);
        for(var i=0; i<b.length; i++){
            console.log(b[i]);
            if(b[i].name == uid){
                request.delete({url:'https://ihatemoney.org/api/projects/'+id+'/members/'+b[i].id,
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
                    res.sendStatus(200);
                });
            }
        }
    });
});

/**
 * Créer une bill pour un projet
 */
router.post('/bills', function(req, res){
    //var projet = req.body.id;
    var id = "testcharlie1";
    var payer = "uid";
    var date = new Date();
    var bill = {
        "what" : "test1",
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
   //var id = req.params.id;
   var id = "testcharlie1";

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
            res.send(body);
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