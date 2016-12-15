var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var userDB = firebase.database().ref().child('users');

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
      var users =  {"user" : snapshot.val()};
      res.send(users);
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

module.exports = router;
