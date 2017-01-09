var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var userDB = database.ref().child('users');
var notifiAmisDB = database.ref().child('notifications').child('amis');
var notifiGroupesDB = database.ref().child('notifications').child('groupes');
var groupDB = database.ref().child('groups');
var eventDB = database.ref().child('events');

/**
 * Création de l'utilisateur : POST => /users
 */
router.post('/', function(req, res){

    var uid = req.body.uid;

    if(req.body.uid_mail)
        uid = req.body.uid_mail;

    // Check si existe le renvoie sinon le crée
    userDB.child(uid).once('value', function(snapshot){
        if(snapshot.val()){
            res.send(snapshot.val());
        }else{
            userDB.child(uid).child('email').set(req.body.email);
            userDB.child(uid).child('displayName').set(req.body.displayName);
            userDB.child(uid).child('photoURL').set(req.body.photoURL);
            userDB.child(uid).child('providerId').set(req.body.providerId);
            userDB.child(uid).child('uid').set(uid);
            userDB.child(uid).once('value', function(my_user) {
                res.send(my_user.val());
            });
        }
    });
});

/**
 *  Récupération de l'utilisateur : GET => /users/:uid
 */
router.get('/:uid', function(req, res){
    userDB.child(req.params.uid).once('value', function(snapshot){
        var user =  {"user" : snapshot.val()};
        res.send(user);
    })
});

/**
 * Récupération de tous les utilisateurs : GET => /users
 */
router.get('/', function(req, res){
    userDB.once('value', function(snapshot){
        var users =  {"users" : snapshot.val()};
        res.send(users);
    })

});



//// FRIENDS

/**
 * Ajout d'un amis à l'utilisateur => POST : /friends
 */
router.post('/friends', function(req, res){
    // uid de l'utilisateurs demandant l'ajout d'amis
    var uidD = req.body.uidD;
    // uid de l'utilisateurs recevant l'ajout d'amis
    var uidR = req.body.uidR;

    // ajout de l'amis
    userDB.child(uidR).child('friends').child(uidD).set(true);
    userDB.child(uidD).child('friends').child(uidR).set(true);

    // suppresion des notifs
    notifiAmisDB.child(uidR).child(uidD).remove();
    notifiAmisDB.child(uidD).child(uidR).remove();

    groupDB.once("value", function(groups){
        userDB.once("value", function(users){
            notifiAmisDB.child(uidR).once('value', function(namis){
                notifiGroupesDB.child(uidR).once('value', function(ngroups) {
                    var nAmis = namis.val();
                    var nGroupes = ngroups.val();
                    var all_users = users.val();
                    var my_user = all_users[uidR];
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

//// GROUPS

/**
 * Rejoindre un groupe
 */
router.post('/groups', function(req, res){

    // id du gorupe demandant de rejoindre le groupe
    var idG = req.body.idG;
    // uid de l'utilisateurs recevant la demande de rejoindre le groupe
    var uidR = req.body.uidR;

    // ajout de l'amis
    userDB.child(uidR).child('groups').child(idG).set(true);
    groupDB.child(idG).child('membres').child(uidR).set(true);

    // suppresion des notifs
    notifiGroupesDB.child(uidR).child(idG).remove();

    userDB.child(uidR).once('value', function(snapshot){
        var user =  {"user" : snapshot.val()};
        res.send(user);
    })
});

/**
 * Quitter un groupe
 *
 * Supprimer :
 *      - l'utilisateur du groupe
 *      - le groupe de l'utilisateur
 *      - Si groupe sans membres supprimer :
 *          - tous les events du groups
 *          - le groupe
 *          - les events de l'utilisateur
 */
router.delete('/:uid/groups/:id', function(req, res){

    var uid = req.params.uid;
    var idgroup = req.params.id;

    userDB.child(uid).child('groups').child(idgroup).remove();
    groupDB.child(idgroup).child('membres').child(uid).remove();

    groupDB.child(idgroup).child('membres').once('value', function(snapshot){
        // check s'il y a des membres si pas delete all event vote chat ect
        if(snapshot.val()){
            groupDB.child(idgroup).child("events").once("value", function(snap){
                var e = snap.val();
                Object.keys(e).forEach(function(key){
                    userDB.child(uid).child("events").child(key).remove();
                    eventDB.child(key).remove();
                });
            });
        }
    });

    groupDB.child(idgroup).remove();

    // Renvoie le user et ses groupes
    userDB.child(uid).once('value', function(user){
        groupDB.once('value', function(groups){
            var all_groups = groups.val();
            var groupsRes = [];
            if(all_groups){
                var my_user = user.val();
                if(my_user){
                    if(my_user.groups){
                        for(var g in my_user.groups){
                            if(all_groups[g]){
                                groupsRes.push(all_groups[g]);
                            }
                        }
                    }
                }
            }
            var result = {
                "groups" : groupsRes,
                "user" : my_user
            };
            res.send(result);
        });
    });

});


module.exports = router;
