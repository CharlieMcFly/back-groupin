/**
 * Created by charlie on 21/12/16.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var eventsDB = database.ref().child('events');
var groupsDB = database.ref().child('groups');
var usersDB = database.ref().child('users');

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
    eventsDB.child(key).child("createur").set(req.body.userId);
    eventsDB.child(key).child("description").set(req.body.description);
    eventsDB.child(key).child("photoURL").set(req.body.photoURL);
    eventsDB.child(key).child("dateDebut").set(req.body.dateDebut);
    eventsDB.child(key).child("dateFin").set(req.body.dateFin);
    eventsDB.child(key).child("theme").set(req.body.theme);
    eventsDB.child(key).child("prix").set(req.body.prix);
    eventsDB.child(key).child("obj").set(req.body.obj);

    groupsDB.child(req.body.groupId).child("events").child(key).set(true);

    usersDB.child(req.body.userId).child("events").child(key).set(true);


    eventsDB.once('value', function(snapshot){
        var e = snapshot.val();
        groupsDB.once("value", function(s){
            var g = s.val();
            usersDB.child(req.body.userId).once("value", function(snap) {
                var u = snap.val();
                var r = {
                    "events": e,
                    "user": u,
                    "groups": g
                };
                res.send(r);
            });
        });
    });
});


/**
 * Supprime un event
 */
router.delete('/:key/groups/:groupid/users/:uid', function(req, res){

    var eventId = req.params.key;
    var groupid = req.params.groupid;
    var uid = req.params.uid;

    eventsDB.child(eventId).child('participants').once("value", function(snapshot){
       var p = snapshot.val();
       if(p == null){
           groupsDB.child(groupid).child('events').child(eventId).remove();
           eventsDB.child(eventId).remove();
       }else{
           Object.keys(p).forEach(function(key, index){
               usersDB.child(key).child('events').child(eventId).remove();
           });
           groupsDB.child(groupid).child('events').child(eventId).remove();
           eventsDB.child(eventId).remove();
       }
        eventsDB.once('value', function(snapshot){
            var e = snapshot.val();
            groupsDB.once("value", function(s){
                var g = s.val();
                usersDB.child(uid).once("value", function(snap) {
                    var u = snap.val();
                    var r = {
                        "events": e,
                        "user": u,
                        "groups": g
                    };
                    res.send(r);
                });
            });
        });
    });

});


module.exports = router;