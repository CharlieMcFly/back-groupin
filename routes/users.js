var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();

/**
 * Création de l'utilisateur : POST => /users
 */
router.post('/', function(req, res){

  var uid = req.body.uid.replace("@", "-").replace(".","-");
  req.body.uid = uid;

  var userDB = firebase.database().ref().child('users').child(uid);
  userDB.set(req.body);

  firebase.database().ref().child('users').child(uid).once('value', function(snapshot){
      res.send(snapshot.val());
  })
});

/**
 *  Récupération de l'utilisateur : GET => /users/:uid
 */
router.get('/:uid', function(req, res){
  firebase.database().ref().child('users').child(req.params.uid).once('value', function(snapshot){
    res.send(snapshot.val());
  })
});

/**
 * Récupération de tous les utilisateurs : GET => /users
 */
router.get('/', function(req, res){
  firebase.database().ref().child('users').once('value', function(snapshot){
    res.send(snapshot.val());
  })

});

module.exports = router;
