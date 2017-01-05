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
                                    var d = new Date(all_events[e].dateDebut);
                                    var f = new Date(all_events[e].dateFin);
                                    all_events[e].dateDebut = d.getDate()+" / " +d.getMonth()+1 + " / " + d.getFullYear()+ " à " + d.getHours() + ":" + d.getMinutes();
                                    all_events[e].dateFin = f.getDate()+" / " +f.getMonth()+1 + " / " + f.getFullYear()+ " à " + f.getHours() + ":"  + f.getMinutes() ;
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
 * Créer un event et le renvoie
 */
router.post('/', function(req, res) {

    var key = req.body.id;
    var uid = req.body.userId;
    var groupId = req.body.groupId;

    if (key == undefined){
        key = eventDB.push().key;
        eventDB.child(key).child("id").set(key);
        eventDB.child(key).child("participants").child(uid).set(true);
    }

    eventDB.child(key).child("nom").set(req.body.nom);
    eventDB.child(key).child("createur").set(uid);
    eventDB.child(key).child("description").set(req.body.description);
    eventDB.child(key).child("photoURL").set(req.body.photoURL);
    eventDB.child(key).child("dateDebut").set(req.body.dateDebut);
    eventDB.child(key).child("dateFin").set(req.body.dateFin);

    // OPTIONNELS
    if(req.body.theme)
        eventDB.child(key).child("theme").set(req.body.theme);
    if(req.body.prix)
        eventDB.child(key).child("prix").set(req.body.prix);
    if(req.body.obj)
        eventDB.child(key).child("obj").set(req.body.obj);

    groupDB.child(groupId).child("events").child(key).set(true);
    userDB.child(uid).child("events").child(key).set(true);

    groupDB.child(groupId).once("value", function(group){
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
                                    var d = new Date(all_events[e].dateDebut);
                                    var f = new Date(all_events[e].dateFin);
                                    all_events[e].dateDebut = d.getDate()+" / " +d.getMonth()+1 + " / " + d.getFullYear()+ " à " + d.getHours() + ":" + d.getMinutes();
                                    all_events[e].dateFin = f.getDate()+" / " +f.getMonth()+1 + " / " + f.getFullYear()+ " à " + f.getHours() + ":"  + f.getMinutes() ;
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
 * Supprime un event
 */
router.delete('/:key/groups/:groupid/users/:uid', function(req, res){

    var eventId = req.params.key;
    var groupId = req.params.groupid;
    var uid = req.params.uid;

    // RECUPERE LES PARTICIPANTS
    eventDB.child(eventId).child('participants').once("value", function(snapshot){
        var p = snapshot.val();

        // SI PARTICIPANTS
        if(p){
            Object.keys(p).forEach(function(key, index){
                userDB.child(key).child('events').child(eventId).remove();
            });
        }
        groupDB.child(groupId).child('events').child(eventId).remove();
        eventDB.child(eventId).remove();

        groupDB.child(groupId).once("value", function(group){
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
                                        var d = new Date(all_events[e].dateDebut);
                                        var f = new Date(all_events[e].dateFin);
                                        all_events[e].dateDebut = d.getDate()+" / " +d.getMonth()+1 + " / " + d.getFullYear()+ " à " + d.getHours() + ":" + d.getMinutes();
                                        all_events[e].dateFin = f.getDate()+" / " +f.getMonth()+1 + " / " + f.getFullYear()+ " à " + f.getHours() + ":"  + f.getMinutes() ;
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
});

/**
 * Ajout ou suppression de l'user à l'évent
 */
router.post('/participants', function(req, res){

    var uid = req.body.uid;
    var event = req.body.event;
    var participe = req.body.participe;
    var group = req.body.group;

    userDB.child(uid).child('events').child(event).set(participe);
    eventDB.child(event).child('participants').child(uid).set(participe);

    groupDB.child(group).once("value", function(group){
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
                                    var d = new Date(all_events[e].dateDebut);
                                    var f = new Date(all_events[e].dateFin);
                                    all_events[e].dateDebut = d.getDate()+" / " +d.getMonth()+1 + " / " + d.getFullYear()+ " à " + d.getHours() + ":" + d.getMinutes();
                                    all_events[e].dateFin = f.getDate()+" / " +f.getMonth()+1 + " / " + f.getFullYear()+ " à " + f.getHours() + ":"  + f.getMinutes() ;
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


module.exports = router;