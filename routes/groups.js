/**
 * Created by charlie on 20/12/16.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var usersDB = database.ref().child('users');
var groupsDB = database.ref().child('groups');

/**
 * Renvoie tous les groupes
 */
router.get('/', function(req, res){

    groupsDB.once('value', function(snapshot){
        var g = {"groups" : snapshot.val()};
        res.send(g);
    })

});

/**
 * Renvoie un groupe en particulier
 */
router.get('/:key', function(req, res){
    groupsDB.child(req.params.key).once('value', function(snapshot){
        var g = {"group" : snapshot.val()};
        res.send(g);
    })
});

/**
 * Créer et update un groupe et le renvoie
 */
router.post('/', function(req, res) {

    var key = req.body.id;
    if (key == undefined){
        key = groupsDB.push().key;
        groupsDB.child(key).child("id").set(key);
    }

    groupsDB.child(key).child("nom").set(req.body.nom);
    groupsDB.child(key).child("description").set(req.body.description);
    groupsDB.child(key).child("photoURL").set(req.body.photoURL);
    groupsDB.child(key).child("membres").child(req.body.uid).set(true);
    usersDB.child(req.body.uid).child("groups").child(key).set(true);

    usersDB.child(req.body.uid).once('value', function(snapshot){
        var user = snapshot.val();
        groupsDB.once('value', function(s) {
            var groups = s.val();
            var u = {
                "user": user,
                "groups" : groups
            };
            res.send(u);
        });
    })
});

/**
 * Supprime un groupe
 */
router.delete('/:key', function(req, res){

    groupsDB.child(req.params.key).remove();
    res.sendStatus(200);

});


module.exports = router;





