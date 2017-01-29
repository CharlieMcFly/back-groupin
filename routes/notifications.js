/**
 * Created by Charlie on 30/11/2016.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var notifiAmisDB = database.ref().child('notifications').child('amis');
var notifiGroupesDB = database.ref().child('notifications').child('groupes');
var notifiEventsDB = database.ref().child('notifications').child('events');
var userDB = database.ref().child('users');
var groupDB = database.ref().child('groups');
var eventDB = database.ref().child('events');

/// AMIS ///

/**
 * Ajout d'une notification pour l'amis que l'on a invité
 */
router.post('/amis', function(req, res){
    // uid de l'utilisateurs demandant l'ajout d'amis
    var uidD = req.body.uidD;
    // uid de l'utilisateurs recevant l'ajout d'amis
    var uidR = req.body.uidR;

    // Ajout d'une notification amis
    notifiAmisDB.child(uidR).child(uidD).set(true);

    res.send({"message" : "OK"});

});

/**
 * Ajout d'une notification pour le useer à propos de l'évent
 */
router.post('/events', function(req, res){
    // id de l'event
    var uidE = req.body.uidE;

    // uid de l'utilisateurs recevant l'ajout d'amis
    var uidR = req.body.uidR;

    // Ajout d'une notification amis
    notifiEventsDB.child(uidR).child(uidD).set(true);

    res.send({"message" : "OK"});

});

/**
 * Récupération des notifications d'une personne
 */
router.get('/:uid', function(req, res){

    var uid = req.params.uid;
    eventDB.once("value", function(events){
        groupDB.once("value", function(groups){
            userDB.once("value", function(users){
                notifiAmisDB.child(uid).once('value', function(namis){
                    notifiEventsDB.child(uid).once('value', function(nevents){
                        notifiGroupesDB.child(uid).once('value', function(ngroups) {
                            var nAmis = namis.val();
                            var nGroupes = ngroups.val();
                            var nEvents = nevents.val();
                            var all_events = events.val();
                            var all_users = users.val();
                            var all_groups = groups.val();

                            var my_user = all_users[uid];
                            var tabNotifAmis = [];
                            var tabNotifGroupes = [];
                            var tabNotifEvents = [];

                            if(all_users && all_groups){
                                if(nAmis){
                                    Object.keys(nAmis).forEach(function(a){
                                        if(all_users[a])
                                            tabNotifAmis.push(all_users[a]);
                                    })
                                }
                                if(nGroupes){
                                    Object.keys(nGroupes).forEach(function(g){
                                        if(all_groups[g])
                                            tabNotifGroupes.push(all_groups[g]);
                                    })
                                }
                                if(nEvents){
                                    Object.keys(nEvents).forEach(function(e){
                                        if(all_events[e]){
                                            console.log(nEvents[e]);
                                            if(nEvents[e] == "created")
                                                all_events[e].create = true;
                                            else if (nEvents[e] == "modified")
                                                all_events[e].modified = true;
                                            else
                                                all_events[e].rappel = true;
                                            tabNotifEvents.push(all_events[e]);
                                        }
                                    })
                                }
                            }
                            var n = {
                                "user" : my_user,
                                "notifsAmis" : tabNotifAmis,
                                "notifsGroupes" : tabNotifGroupes,
                                "notifsEvents" : tabNotifEvents
                            };
                            res.send(n);
                        });
                    });
                });
            });
        });
    });
});

/**
 * Suppression d'une notification amis
 */
router.delete('/users/:uid/friends/:ami', function(req, res){
    notifiAmisDB.child(req.params.uid).child(req.params.ami).remove();
    notifiAmisDB.child(req.params.ami).child(req.params.uid).remove();

    eventDB.once("value", function(events){
        groupDB.once("value", function(groups){
            userDB.once("value", function(users){
                notifiAmisDB.child(uid).once('value', function(namis){
                    notifiEventsDB.child(uid).once('value', function(nevents){
                        notifiGroupesDB.child(uid).once('value', function(ngroups) {
                            var nAmis = namis.val();
                            var nGroupes = ngroups.val();
                            var nEvents = nevents.val();
                            var all_events = events.val();
                            var all_users = users.val();
                            var all_groups = groups.val();

                            var my_user = all_users[uid];
                            var tabNotifAmis = [];
                            var tabNotifGroupes = [];
                            var tabNotifEvents = [];

                            if(all_users && all_groups){
                                if(nAmis){
                                    Object.keys(nAmis).forEach(function(a){
                                        if(all_users[a])
                                            tabNotifAmis.push(all_users[a]);
                                    })
                                }
                                if(nGroupes){
                                    Object.keys(nGroupes).forEach(function(g){
                                        if(all_groups[g])
                                            tabNotifGroupes.push(all_groups[g]);
                                    })
                                }
                                if(nEvents){
                                    Object.keys(nEvents).forEach(function(e){
                                        if(all_events[e])
                                            tabNotifEvents.push(all_events[e]);
                                    })
                                }
                            }
                            var n = {
                                "user" : my_user,
                                "notifsAmis" : tabNotifAmis,
                                "notifsGroupes" : tabNotifGroupes,
                                "notifsEvents" : tabNotifEvents
                            };
                            res.send(n);
                        });
                    });
                });
            });
        });
    });
});


/// GROUPES ///

/**
 * Notification d'ajout d'un membres
 */
router.post('/groups', function(req, res){

    // id du groupe demandant l'ajout d'amis
    var idG = req.body.idG;
    // uid de l'utilisateurs recevant l'ajout d'amis
    var uidR = req.body.uidR;

    // Ajout d'uns notif d'un user dans un groupe
    notifiGroupesDB.child(uidR).child(idG).set(true);

    res.send({"message" : "OK"});

});


/**
 * Suppression d'une notification une fois valider
 */
router.delete('/users/:uid/groups/:idgroup', function(req, res){

    var uid = req.params.uid;
    var groupid = req.params.idgroup;

    notifiGroupesDB.child(uid).child(groupid).remove();
    notifiGroupesDB.child(groupid).child(uid).remove();

    eventDB.once("value", function(events){
        groupDB.once("value", function(groups){
            userDB.once("value", function(users){
                notifiAmisDB.child(uid).once('value', function(namis){
                    notifiEventsDB.child(uid).once('value', function(nevents){
                        notifiGroupesDB.child(uid).once('value', function(ngroups) {
                            var nAmis = namis.val();
                            var nGroupes = ngroups.val();
                            var nEvents = nevents.val();
                            var all_events = events.val();
                            var all_users = users.val();
                            var all_groups = groups.val();

                            var my_user = all_users[uid];
                            var tabNotifAmis = [];
                            var tabNotifGroupes = [];
                            var tabNotifEvents = [];

                            if(all_users && all_groups){
                                if(nAmis){
                                    Object.keys(nAmis).forEach(function(a){
                                        if(all_users[a])
                                            tabNotifAmis.push(all_users[a]);
                                    })
                                }
                                if(nGroupes){
                                    Object.keys(nGroupes).forEach(function(g){
                                        if(all_groups[g])
                                            tabNotifGroupes.push(all_groups[g]);
                                    })
                                }
                                if(nEvents){
                                    Object.keys(nEvents).forEach(function(e){
                                        if(all_events[e])
                                            tabNotifEvents.push(all_events[e]);
                                    })
                                }
                            }
                            var n = {
                                "user" : my_user,
                                "notifsAmis" : tabNotifAmis,
                                "notifsGroupes" : tabNotifGroupes,
                                "notifsEvents" : tabNotifEvents
                            };
                            res.send(n);
                        });
                    });
                });
            });
        });
    });


});


module.exports = router;
