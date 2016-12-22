/**
 * Created by charlie on 21/12/16.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var usersDB = database.ref().child('users');
var eventsDB = database.ref().child('events');
var groupsDB = database.ref().child('groups');
var userDB = database.ref().child('users');

/**
 * Renvoie tous les events
 */
router.get('/', function(req, res){

    eventsDB.once('value', function(snapshot){
        var e = {"events" : snapshot.val()};
        res.send(e);
    })

});

/**
 * Renvoie un event en particulier
 */
router.get('/:key', function(req, res){
    eventsDB.child(req.params.key).once('value', function(snapshot){
        var g = {"event" : snapshot.val()};
        res.send(g);
    })
});

/**
 * Créer et update un event et le renvoie
 */
router.post('/', function(req, res) {

    var key = req.body.id;
    if (key == undefined){
        key = eventsDB.push().key;
        eventsDB.child(key).child("id").set(key);
        eventsDB.child(key).child("participants").child(req.body.userId).set(true);
    }

    eventsDB.child(key).child("nom").set(req.body.nom);
    eventsDB.child(key).child("description").set(req.body.description);
    eventsDB.child(key).child("photoURL").set(req.body.photoURL);
    eventsDB.child(key).child("dateDebut").set(req.body.dateDebut);
    eventsDB.child(key).child("dateFin").set(req.body.dateFin);
    eventsDB.child(key).child("theme").set(req.body.theme);
    eventsDB.child(key).child("prix").set(req.body.prix);
    eventsDB.child(key).child("obj").set(req.body.obj);

    groupsDB.child(req.body.groupId).child("events").child(key).set(true);

    userDB.child(req.body.userId).child("events").child(key).set(true);


    eventsDB.child(key).once('value', function(snapshot){
        var e = {"event" : snapshot.val()};
        res.send(e);
    })
});


/**
 * Supprime un event
 */
router.delete('/:key', function(req, res){

    eventsDB.child(req.params.key).remove();
    res.sendStatus(200);

});


module.exports = router;