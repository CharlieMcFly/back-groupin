var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var userDB = firebase.database().ref().child('users');

/**
 * Création de l'utilisateur : POST => /users
 *
 * Problème rencontré : Lors de la création de l'utilisateur dans la database de firebase, il était impossible de mettre
 * une clé avec une adresse email, donc on a modifié cette adresse pour qu'elle puisse devenir un uid, en remplacant @ et .
 * par des -.
 */
router.post('/', function(req, res){

  var user = {
    name : req.body.displayName,
    email : req.body.email,
    photoUrl : req.body.photoURL,
    provider : req.body.providerId,
    // Afin de pouvoir créer un uid avec l'utilisateur sans facebook et google
    uid : req.body.uid.replace("@", "-").replace(".", "-")
  };

  var isRegister = false;
  userDB.once('value', function(snapshot) {
    if (snapshot.val()) {
        // Itération de tous les users
        snapshot.forEach(function(snap){
            if(snap.val().uid === user.uid){
              isRegister = true;
              res.sendStatus(200);
            }
        });
        if(!isRegister) {
            firebase.database().ref('users/' + user.uid).set(user);
            res.sendStatus(200);
        }
    }else{
      firebase.database().ref('users/' + user.uid).set(user);
      res.sendStatus(200);
    }
  });
});

/**
 * Récupéreration de l'utilisateur : GET => /users/:uid
 */
router.get('/:uid', function(req, res){

    var uid = req.params.uid.replace("@", "-").replace(".", "-");
    var user = userDB.child(uid).once('value').then(function(snapshot){
      if(snapshot.val())
        res.send(snapshot.val());
      else{
        res.send({});
      }
    });

});

module.exports = router;
