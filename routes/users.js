var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();

/**
 * Création de l'utilisateur : POST => /users
 */
router.post('/', function(req, res){
  var user = {
    name: req.body.displayName,
    email: req.body.email,
    photoUrl: req.body.photoURL,
    provider: req.body.providerId,
    uid: req.body.uid,
  };

  var userDB = firebase.database().ref().child('users').child(user.uid);
  userDB.set(user);

  firebase.database().ref().child('users').child(user.uid).once('value', function(snapshot){
      res.send(snapshot.val());
  })
});

router.get('/:uid', function(req, res){
  var ref = firebase.database().ref();
  ref.child('users').orderByChild('name').equalTo('Alex').on('child_added', function(snapshot){
    res.sendStatus(200);
  });
});

router.get('/', function(req, res){
  res.sendStatus(200);
});

module.exports = router;
