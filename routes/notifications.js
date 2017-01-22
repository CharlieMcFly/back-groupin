/**
 * Created by Charlie on 30/11/2016.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var notifiAmisDB = database.ref().child('notifications').child('amis');
var notifiGroupesDB = database.ref().child('notifications').child('groupes');
var userDB = database.ref().child('users');
var groupDB = database.ref().child('groups');

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
 * Récupération des notifications d'une personne
 */
router.get('/:uid', function(req, res){

    var uid = req.params.uid;

    groupDB.once("value", function(groups){
        userDB.once("value", function(users){
            notifiAmisDB.child(uid).once('value', function(namis){
                notifiGroupesDB.child(uid).once('value', function(ngroups) {
                    var nAmis = namis.val();
                    var nGroupes = ngroups.val();
                    var all_users = users.val();
                    var my_user = all_users[uid];
                    var all_groups = groups.val();
                    var tabNotifAmis = [];
                    var tabNotifGroupes = [];

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
                    }
                    var n = {
                        "user" : my_user,
                        "notifsAmis" : tabNotifAmis,
                        "notifsGroupes" : tabNotifGroupes
                    };
                    res.send(n);
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
    res.sendStatus(200);
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

    groupDB.once("value", function(groups){
        userDB.once("value", function(users){
            notifiAmisDB.child(uid).once('value', function(namis){
                notifiGroupesDB.child(uid).once('value', function(ngroups) {
                    var nAmis = namis.val();
                    var nGroupes = ngroups.val();
                    var all_users = users.val();
                    var my_user = all_users[uid];
                    var all_groups = groups.val();
                    var tabNotifAmis = [];
                    var tabNotifGroupes = [];

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
                    }
                    var n = {
                        "user" : my_user,
                        "notifsAmis" : tabNotifAmis,
                        "notifsGroupes" : tabNotifGroupes
                    };
                    res.send(n);
                });
            });
        });
    });


});


module.exports = router;
