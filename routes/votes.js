/**
 * Created by charlie on 22/12/16.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var eventDB = database.ref().child('events');
var userDB = database.ref().child('users');
var groupDB = database.ref().child('groups');
var voteDB = database.ref().child('votes');

/**
 * Renvoie les votes d'un groupe
 */
router.get('/users/:uid/groups/:key', function(req, res){
    
    var uid = req.params.uid;
    var groupid = req.params.key;
    
    voteDB.once('value', function(votes){
       userDB.child(uid).once("value", function(user){
          groupDB.child(groupid).once("value", function(group){
              var all_votes = votes.val();
              var my_user = user.val();
              var my_group = group.val();
              var tabVotes = [];
              if(my_group){
                  if(all_votes){
                     if(my_group.votes){
                         for(var v in my_group.votes){
                             if(all_votes[v]){
                                 tabVotes.push(all_votes[v]);
                             }
                         }
                     }
                  }
              }
              var result = {
                  "user": my_user,
                  "votes": tabVotes
              };
              res.send(result);

          });
       });
    });
});

/**
 * Créer un vote et le renvoie
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

    groupDB.child(groupId).child("votes").child(key).set(true);

    voteDB.once('value', function(snapshot){
        var votes = snapshot.val();
        groupDB.once("value", function(snap){
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
        groupDB.once("value", function(snap){
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

    userDB.child(uid).child("votes").child(idVote).remove();
    voteDB.child(idVote).remove();

    voteDB.once('value', function(snapshot){
        var votes = snapshot.val();
        groupDB.once("value", function(snap){
            var groups = snap.val();
            var e = {"votes" : votes, "groups" : groups};
            res.send(e);
        });
    });

});


module.exports = router;