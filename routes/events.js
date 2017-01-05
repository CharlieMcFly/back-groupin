/**
 * Created by charlie on 21/12/16.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var eventDB = database.ref().child('events');
var groupDB = database.ref().child('groups');
var userDB = database.ref().child('users');

/**
 * Renvoie tous les events
 */
router.get('/', function(req, res){

    eventDB.once('value', function(snapshot){
        var e = {"events" : snapshot.val()};
        res.send(e);
    })

});

/**
 * Renvoie les events d'un groupe
 */
router.get('/users/:uid/groups/:key', function(req, res){

    var uid = req.params.uid;
    var key = req.params.key;

    groupDB.child(key).once("value", function(group){
        userDB.child(uid).once('value', function(user) {
            eventDB.once("value", function (events) {
                var my_user = user.val();
                var my_group = group.val();
                var resEvents = [];
                if (my_group) {
                    if (my_group.events) {
                        var all_events = events.val();
                        if (all_events) {
                            for (var e in my_group.events) {
                                if (all_events[e]) {
                                    resEvents.push(all_events[e]);
                                }
                            }
                        }
                    }
                }
                var result = {
                    "user": my_user,
                    "events": resEvents
                };
                res.send(result);
            });
        });

    });

});

/**
 * Créer et update un event et le renvoie
 */
router.post('/', function(req, res) {

    var key = req.body.id;
    if (key == undefined){
        key = eventDB.push().key;
        eventDB.child(key).child("id").set(key);
        eventDB.child(key).child("participants").child(req.body.userId).set(true);
    }

    eventDB.child(key).child("nom").set(req.body.nom);
    eventDB.child(key).child("createur").set(req.body.userId);
    eventDB.child(key).child("description").set(req.body.description);
    eventDB.child(key).child("photoURL").set(req.body.photoURL);
    eventDB.child(key).child("dateDebut").set(req.body.dateDebut);
    eventDB.child(key).child("dateFin").set(req.body.dateFin);
    eventDB.child(key).child("theme").set(req.body.theme);
    eventDB.child(key).child("prix").set(req.body.prix);
    eventDB.child(key).child("obj").set(req.body.obj);

    groupDB.child(req.body.groupId).child("events").child(key).set(true);

    userDB.child(req.body.userId).child("events").child(key).set(true);


    eventDB.once('value', function(snapshot){
        var e = snapshot.val();
        groupDB.once("value", function(s){
            var g = s.val();
            userDB.child(req.body.userId).once("value", function(snap) {
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

    eventDB.child(eventId).child('participants').once("value", function(snapshot){
       var p = snapshot.val();
       if(p == null){
           groupDB.child(groupid).child('events').child(eventId).remove();
           eventDB.child(eventId).remove();
       }else{
           Object.keys(p).forEach(function(key, index){
               userDB.child(key).child('events').child(eventId).remove();
           });
           groupDB.child(groupid).child('events').child(eventId).remove();
           eventDB.child(eventId).remove();
       }
        eventDB.once('value', function(snapshot){
            var e = snapshot.val();
            groupDB.once("value", function(s){
                var g = s.val();
                userDB.child(uid).once("value", function(snap) {
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

/**
 * Ajout l'user à l'évent
 */
router.post('/participants', function(req, res){

    var uid = req.body.uid;
    var event = req.body.event;
    var participe = req.body.participe;

    userDB.child(uid).child('events').child(event).set(participe);
    eventDB.child(event).child('participants').child(uid).set(participe);

    eventDB.once('value', function(snapshot){
        var e = snapshot.val();
        userDB.child(uid).once("value", function(snap) {
            var u = snap.val();
            var r = {
                "events": e,
                "user": u
            };
            res.send(r);
        });
    });

});


module.exports = router;