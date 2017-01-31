/**
 * Created by charlie on 21/12/16.
 */
var express = require('express');
var router = express.Router();
var request = require('request');
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var notifEventsDB = database.ref().child('notifications').child('events');
var eventDB = database.ref().child('events');
var groupDB = database.ref().child('groups');
var userDB = database.ref().child('users');
var event = "https://platine-groupin.herokuapp.com/events";

/**
 * Renvoie les events d'un groupe
 */
router.get('/users/:uid/groups/:key', function(req, res){

    var uid = req.params.uid;
    var key = req.params.key;

    groupDB.child(key).once("value", function(group){
        userDB.once('value', function(users) {
            eventDB.once("value", function (events) {

                var all_users = users.val();
                var my_user = all_users[uid];
                var my_group = group.val();
                var resEvents = [];
                var all_events = events.val();

                if (my_group && all_events && my_group.events) {
                    // Récupère les events du group
                    for (var e in my_group.events) {
                        if (all_events[e]) {
                            // Récupère les participants s'il y en a
                            var participants = all_events[e].participants;
                            if(participants){
                                var all_participants = [];
                                Object.keys(participants).forEach(function(k){
                                    all_participants.push(all_users[k]);
                                });
                                all_events[e].participantsValues = all_participants;
                            }
                            // Récupre les objects de l'évent s'il y en a
                            var eventObj = all_events[e].obj;
                            if(eventObj){
                                var all_object = [];
                                Object.keys(eventObj).forEach(function(k){
                                    all_object.push(k);
                                });
                                all_events[e].obj = all_object;
                            }
                            resEvents.push(all_events[e]);
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

    var uid = req.body.userId;
    var groupId = req.body.groupId;
    var key = eventDB.push().key;

    eventDB.child(key).child("id").set(key);
    eventDB.child(key).child("participants").child(uid).set(true);
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
    if(req.body.obj){
        var objets = req.body.obj;
        for(var i = 0; i<objets.length; i++){
            eventDB.child(key).child("obj").child(objets[i].obj).set(false);
        }
    }

    groupDB.child(groupId).once("value", function(group){
       var my_group = group.val();
       if(my_group.membres){
           Object.keys(my_group.membres).forEach(function(k){
              notifEventsDB.child(k).child(key).set("created");
           });
       }


    });

    // Add l'évent au groupe et au user
    groupDB.child(groupId).child("events").child(key).set(true);
    userDB.child(uid).child("events").child(key).set(true);

    // renvoie tous les events et le user
    request.get(event + "/users/"+uid+"/groups/"+ groupId, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        res.send(JSON.parse(body));
    });

});

/**
 * Modifier un event et le renvoie
 */
router.post('/edit', function(req, res) {

    var key = req.body.id;
    var uid = req.body.userId;
    var groupId = req.body.groupId;

    eventDB.child(key).child("nom").set(req.body.nom);
    eventDB.child(key).child("description").set(req.body.description);
    eventDB.child(key).child("photoURL").set(req.body.photoURL);
    eventDB.child(key).child("dateDebut").set(req.body.dateDebut);
    eventDB.child(key).child("dateFin").set(req.body.dateFin);

    // OPTIONNELS
    if(req.body.theme)
        eventDB.child(key).child("theme").set(req.body.theme);
    if(req.body.prix)
        eventDB.child(key).child("prix").set(req.body.prix);
    if(req.body.obj){
        var objets = req.body.obj;
        eventDB.child(key).child("obj").remove();
        for(var i = 0; i<objets.length; i++){
            eventDB.child(key).child("obj").child(objets[i].obj).set(false);
        }
    }


    var participants = req.body.participants;
    if(participants){
        Object.keys(participants).forEach(function(k){
           notifEventsDB.child(k).child(key).set("modified");
        });
    }

    // renvoie tous les events et le user
    request.get(event + "/users/"+uid+"/groups/"+ groupId, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        res.send(JSON.parse(body));
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

        // renvoie tous les events et le user
        request.get(event + "/users/"+uid+"/groups/"+ groupId, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            res.send(JSON.parse(body));
        });

    });
});

/**
 * Ajout ou suppression de l'user à l'évent
 */
router.post('/participants', function(req, res){

    var uid = req.body.uid;
    var eventid = req.body.event;
    var participe = req.body.participe;
    var group = req.body.group;

    if(participe){
        eventDB.child(eventid).child('participants').child(uid).set(participe);
        userDB.child(uid).child('events').child(eventid).set(participe);
    }
    else{
        eventDB.child(eventid).child('participants').child(uid).remove();
        userDB.child(uid).child('events').child(eventid).remove();
    }

    // renvoie tous les events et le user
    request.get(event + "/users/"+uid+"/groups/"+ group, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        res.send(JSON.parse(body));
    });
});

/**
 * Envoie un rappel à tous les utilisateurs
 */
router.post('/rappel', function(req, res){

    var idEvent = req.body.idEvent;

    eventDB.child(idEvent).once("value", function(event){
        var my_event = event.val();

        if(my_event.participants){
            Object.keys(my_event.participants).forEach(function(k){
                notifEventsDB.child(k).child(my_event.id).set("rappel");
            });
        }

        res.send({message: "OK"});
    });

});


// CALENDAR

/**
 * Renvoie les events d'un utilisateur
 */
router.get('/users/:uid', function(req, res){
    var uid = req.params.uid;
    userDB.child(uid).once("value", function(user){
       eventDB.once("value", function(events){
          var my_user = user.val();
          var all_events = events.val();
           var tabEvent = [];

           if(my_user && all_events){
              if(my_user.events){
                  for(var e in my_user.events){
                      if(all_events[e]){
                          var event = {
                              "id" : all_events[e].id,
                              "title" : all_events[e].nom,
                              "start" : new Date(all_events[e].dateDebut),
                              "end" : new Date(all_events[e].dateFin),
                              "stick" : true
                          };
                          tabEvent.push(event);
                      }
                  }
              }
            }
           res.send(tabEvent);

       });
    });

});

/**
 * Renvoie les events d'un utilisateur pour android
 */
router.get('/users/:uid/android', function(req, res){
    var uid = req.params.uid;

    userDB.child(uid).once("value", function(user){
        eventDB.once("value", function(events){
            var my_user = user.val();
            var all_events = events.val();
            var tabEvent = {};

            if(my_user && all_events){
                if(my_user.events){
                    for(var e in my_user.events){
                        if(all_events[e]){
                            var event = all_events[e];
                            tabEvent[event["id"]] = event;
                        }
                    }
                }
            }
            res.send(tabEvent);

        });
    });

});

/**
 * Renvoie un event
 */
router.get('/:uid', function(req, res){
    var event = req.params.uid;

    userDB.once("value", function(users){
        eventDB.child(event).once("value", function(event){
            var all_user = users.val();
            var my_event = event.val();
            if(all_user && my_event){
                var tabParticipant = [];
                if(my_event.participants){
                    for(var p in my_event.participants){
                        if(all_user[p]){
                            tabParticipant.push(all_user[p]);
                        }
                    }
                    my_event.participants = tabParticipant;
                }
                res.send(my_event);
            }
        });
    });

});



module.exports = router;