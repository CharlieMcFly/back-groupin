var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var userDB = database.ref().child('users');
var notifAmisDB = database.ref().child('notifications').child('amis');
var notifGroupesDB = database.ref().child('notifications').child('groupes');
var groupDB = database.ref().child('groups');
var eventDB = database.ref().child('events');

/**
 * Création de l'utilisateur : POST => /users
 */
router.post('/', function(req, res){

  var uid = req.body.uid.replace("@", "-").replace(".","-");
  req.body.uid = uid;

  userDB.child(uid).child('email').set(req.body.email);
  userDB.child(uid).child('displayName').set(req.body.displayName);
  userDB.child(uid).child('photoURL').set(req.body.photoURL);
  userDB.child(uid).child('providerId').set(req.body.providerId);
  userDB.child(uid).child('uid').set(req.body.uid);

  userDB.child(uid).once('value', function(snapshot){
      var user =  {"user" : snapshot.val()};
      res.send(user);
  })
});

/**
 *  Récupération de l'utilisateur : GET => /users/:uid
 */
router.get('/:uid', function(req, res){
  userDB.child(req.params.uid).once('value', function(snapshot){
      var users =  {"user" : snapshot.val()};
      res.send(users);
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


/**
 * Suppression d'un user
 */
router.delete('/:uid', function(req, res){
    userDB.child(req.params.uid).remove();
    res.sendStatus(200);
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
    notifAmisDB.child(uidR).child(uidD).remove();
    notifAmisDB.child(uidD).child(uidR).remove();

    userDB.child(uidR).once('value', function(snapshot){
        var user =  {"user" : snapshot.val()};
        res.send(user);
    })
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
    notifGroupesDB.child(uidR).child(idG).remove();

    userDB.child(uidR).once('value', function(snapshot){
        var user =  {"user" : snapshot.val()};
        res.send(user);
    })
});

/**
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
       if(snapshot.val() == null){
           groupDB.child(idgroup).child("events").once("value", function(snap){
               var e = snap.val();
               Object.keys(e).forEach(function(key,index){
                   userDB.child(uid).child("events").child(key).remove();
                   eventDB.child(key).remove();
               });
               groupDB.child(idgroup).remove();
               userDB.child(uid).once('value', function(snapshot){
                   var u = {"user" : snapshot.val()};
                   res.send(u);
               });
           });
       }else{
           userDB.child(uid).once('value', function(snapshot){
               var u = {"user" : snapshot.val()};
               res.send(u);
           });
       }
    });



});


module.exports = router;
