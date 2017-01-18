var express = require('express');
var request = require('request');
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
    userDB.child(uid).child('email').set(req.body.email);
    userDB.child(uid).child('displayName').set(req.body.displayName);
    userDB.child(uid).child('photoURL').set(req.body.photoURL);
    if(req.body.providerId)
        userDB.child(uid).child('providerId').set(req.body.providerId);
    else
        userDB.child(uid).child('providerId').set(req.body.providerData[0].providerId);
    userDB.child(uid).child('uid').set(uid);
    userDB.child(uid).once('value', function(my_user) {
        res.send(my_user.val());
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

    // Ajout de l'amis au compte du groupe
    var key = idG.replace(/-|_/g,'').toLowerCase();
    var params = {"name" : uidR};
    request.post({url:'https://ihatemoney.org/api/projects/'+key+'/members', formData: params,
        'auth': {
            'user': key,
            'pass': key
        }
    }, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Successful!  Server responded with:', body);
    });

    groupDB.once("value", function(groups){
        userDB.once("value", function(users){
            notifiAmisDB.child(uidR).once('value', function(namis){
                notifiGroupesDB.child(uidR).once('value', function(ngroups) {
                    var nAmis = namis.val();
                    var nGroupes = ngroups.val();
                    var all_users = users.val();
                    var all_groups = groups.val();
                    var my_user = all_users[uidR];
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

    var key = idgroup.replace(/-|_/g, "").toLowerCase();
    var auth= {'user': key, 'pass': key};

    // Supprime le user du compte du groupe
    request.get({url:'https://ihatemoney.org/api/projects/'+key+'/members', 'auth': auth},
        function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        var b = JSON.parse(body);
        for(var i=0; i<b.length; i++){
            if(b[i].name == uid){
                request.delete({url:'https://ihatemoney.org/api/projects/'+key+'/members/'+b[i].id,
                    'auth': auth
                }, function optionalCallback(err, httpResponse, body) {
                    if (err) {
                        return console.error('upload failed:', err);
                    }
                    console.log('Successful!  Server responded with:', body);
                });
            }
        }
    });


    // Supprime le projet si plus personne
    groupDB.child(idgroup).child('membres').once('value', function(snapshot){
        var mem = snapshot.val();
        // check s'il y a des membres si pas delete all event vote chat ect
        if(!mem){
            // Remove le projet
            request.delete('https://ihatemoney.org/api/projects/'+key, {'auth': auth },
                function optionalCallback(err, httpResponse, body) {
                    if (err) {
                        return console.error('upload failed:', err);
                    }
                    console.log('Successful!  Server responded with:', body);
            });

            groupDB.child(idgroup).child("events").once("value", function(snap){
                var e = snap.val();
                if(e){
                    Object.keys(e).forEach(function(key){
                        userDB.child(uid).child("events").child(key).remove();
                        eventDB.child(key).remove();
                    });
                }
                groupDB.child(idgroup).remove();
            });
        }
    });


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
