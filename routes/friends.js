/**
 * Created by Charlie on 30/11/2016.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var usersDB = database.ref().child('users');
var notifAmisDB = database.ref().child('notifications').child('amis');

/**
 * Ajout d'un amis à l'utilisateur => POST : /friends
 */
router.post('/', function(req, res){
    // uid de l'utilisateurs demandant l'ajout d'amis
    var uidD = req.body.uidD;
    // uid de l'utilisateurs recevant l'ajout d'amis
    var uidR = req.body.uidR;

    // ajout de l'amis
    usersDB.child(uidR).child('friends').child(uidD).set(true);
    usersDB.child(uidD).child('friends').child(uidR).set(true);

    res.sendStatus(200);
});

/**
 * Récupérer les amis d'un utilisateur
 */
router.get('/:uid', function(req, res){
   // uid de l'utilisateur
    var uid = req.params.uid;

    usersDB.child(uid).child('friends').once('value', function(snapshot){
        var f = {"friends" : snapshot.val()};
        res.send(f);

    })

});

module.exports = router;
