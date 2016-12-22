/**
 * Created by charlie on 22/12/16.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var eventsDB = database.ref().child('events');
var groupsDB = database.ref().child('groups');
var voteDB = database.ref().child('votes');

/**
 * Renvoie tous les votes
 */
router.get('/', function(req, res){

    voteDB.once('value', function(snapshot){
        var v = {"votes" : snapshot.val()};
        res.send(v);
    })

});

/**
 * Renvoie un vote en particulier
 */
router.get('/:key', function(req, res){
    voteDB.child(req.params.key).once('value', function(snapshot){
        var g = {"vote" : snapshot.val()};
        res.send(g);
    })
});

/**
 * Créer et update un vote et le renvoie
 */
router.post('/', function(req, res) {

    var key = req.body.id;
    if (key == undefined){
        key = voteDB.push().key;
        voteDB.child(key).child("id").set(key);
    }

    voteDB.child(key).child("question").set(req.body.nom);
    voteDB.child(key).child("type").set(req.body.description);
    voteDB.child(key).child("choix").set(req.body.photoURL);
    voteDB.child(key).child("reponses").set(req.body.dateDebut);

    groupsDB.child(req.body.groupId).child("votes").child(key).set(true);
    eventsDB.child(req.body.eventId).child("votes").child(key).set(true);

    voteDB.child(key).once('value', function(snapshot){
        var e = {"vote" : snapshot.val()};
        res.send(e);
    })
});


/**
 * Supprime un event
 */
router.delete('/:key', function(req, res){

    voteDB.child(req.params.key).remove();
    res.sendStatus(200);

});


module.exports = router;