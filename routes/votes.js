/**
 * Created by charlie on 22/12/16.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var eventsDB = database.ref().child('events');
var usersDB = database.ref().child('users');
var groupsDB = database.ref().child('groups');
var voteDB = database.ref().child('votes');

/**
 * Renvoie tous les votes
 */
router.get('/', function(req, res){

    voteDB.once('value', function(snapshot){
        var v = {"votes" : snapshot.val()};
        res.send(v);
    })

});

/**
 * Renvoie un vote en particulier
 */
router.get('/:key', function(req, res){
    voteDB.child(req.params.key).once('value', function(snapshot){
        var g = {"vote" : snapshot.val()};
        res.send(g);
    })
});

/**
 * Créer et update un vote et le renvoie
 */
router.post('/', function(req, res) {

    var key = req.body.id;
    if (key == undefined){
        key = voteDB.push().key;
        voteDB.child(key).child("id").set(key);
        voteDB.child(key).child("createur").set(req.body.createur);

    }

    var groupId = req.body.group;

    voteDB.child(key).child("question").set(req.body.question);
    var choices = req.body.choix;
    for(var c in choices) {
        voteDB.child(key).child("choix").child(choices[c].choix).set(0);
    }

    groupsDB.child(groupId).child("votes").child(key).set(true);

    voteDB.once('value', function(snapshot){
        var votes = snapshot.val();
        groupsDB.once("value", function(snap){
            var groups = snap.val();
            var e = {"votes" : votes, "groups" : groups};
            res.send(e);
        });
    });
});

router.post('/users', function(req, res){

    var idVotes = req.body.idVote;
    var uid = req.body.uid;
    var reponse = req.body.reponse;

    var adejavote = false;

    voteDB.child(idVotes).child("a_vote").once("value", function(snap){

        snap.forEach(function(child){
           if(child.key == uid){
               adejavote = true;
           }
        });

        if(!adejavote){
            voteDB.child(idVotes).child("a_vote").child(uid).set(true);
            voteDB.child(idVotes).child("choix").child(reponse).once('value', function(vote){
                var nbv = vote.val();
                nbv = nbv + 1 ;
                voteDB.child(idVotes).child("choix").child(reponse).set(nbv);

            });
        }

    });

    voteDB.once('value', function(snapshot){
        var votes = snapshot.val();
        groupsDB.once("value", function(snap){
            var groups = snap.val();
            var e = {"votes" : votes, "groups" : groups};
            res.send(e);
        });
    });

});


/**
 * Supprime un event
 */
router.delete('/:id/users/:uid', function(req, res){

    var idVote = req.params.id;
    var uid = req.params.uid;

    usersDB.child(uid).child("votes").child(idVote).remove();
    voteDB.child(idVote).remove();

    voteDB.once('value', function(snapshot){
        var votes = snapshot.val();
        groupsDB.once("value", function(snap){
            var groups = snap.val();
            var e = {"votes" : votes, "groups" : groups};
            res.send(e);
        });
    });

});


module.exports = router;