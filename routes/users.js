var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();

/**
 * Création de l'utilisateur : POST => /users
 */
router.post('/', function(req, res){

  var user = {
    name : req.body.name,
    email : req.body.email,
    photoUrl : req.body.photo,
    provider : req.body.providerId,
    uid : req.body.uid,
  };

  var updates = {};
  firebase.database().ref().child('users').orderByChild('uid').equalTo(user.uid).on('value', function(snapshot) {
    if (snapshot.val() == null) {
      // Get a key for a new Post.
      firebase.database().ref().child('users').push(user);
    }
  });

  res.sendStatus(200);

});

router.get('/', function(req, res){
  res.sendStatus(200);
});

module.exports = router;
