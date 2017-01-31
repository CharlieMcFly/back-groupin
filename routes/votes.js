/**
 * Created by charlie on 22/12/16.
 */
var express = require('express');
var request = require('request');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var userDB = database.ref().child('users');
var groupDB = database.ref().child('groups');
var voteDB = database.ref().child('votes');
var vote = "https://platine-groupin.herokuapp.com/votes";

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
              if(my_group && all_votes && my_group.votes){
                 for(var v in my_group.votes){
                     var tabChoix = [];
                     if(all_votes[v] && all_votes[v].choix){
                         for(var c in all_votes[v].choix){
                             if(all_votes[v].a_vote){
                                 var pourcent = ( all_votes[v].choix[c] / Object.keys(all_votes[v].a_vote).length ) * 100;
                                 var choixRes = {
                                     "choix" : c,
                                     "pourcentage" : pourcent
                                 };
                                 tabChoix.push(choixRes);
                             }else{
                                 var choixRes = {
                                     "choix" : c,
                                     "reponse" : false
                                 };
                                 tabChoix.push(choixRes);
                             }
                         }
                         var hasalreadyvote;
                         if(all_votes[v].a_vote && all_votes[v].a_vote[uid])
                             hasalreadyvote = true;
                         else
                             hasalreadyvote = false;
                         all_votes[v].hasalreadyvote = hasalreadyvote;
                         all_votes[v].choix = tabChoix;
                     }
                     tabVotes.push(all_votes[v]);
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
    var uid = req.body.createur;
    var groupId = req.body.group;

    if (key == undefined){
        key = voteDB.push().key;
        voteDB.child(key).child("id").set(key);
        voteDB.child(key).child("createur").set(uid);
        userDB.child(uid).child("votes").child(key).set(true)
    }

    voteDB.child(key).child("question").set(req.body.question);
    voteDB.child(key).child("date").set(firebase.database.ServerValue.TIMESTAMP);
    if(req.body.qcm)
        voteDB.child(key).child("QCM").set(true);
    else
        voteDB.child(key).child("QCM").set(false);

    var choices = req.body.choix;
    for(var c in choices) {
        voteDB.child(key).child("choix").child(choices[c].choix).set(0);
    }

    groupDB.child(groupId).child("votes").child(key).set(true);

    // Récupération des votes
    request.get(vote + "/users/"+uid+"/groups/"+groupId, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        res.send(JSON.parse(body));
    });
});

/**
 * Supprime un vote
 */
router.delete('/:key/groups/:groupid/users/:uid', function(req, res){

    var voteId = req.params.key;
    var groupId = req.params.groupid;
    var uid = req.params.uid;

    userDB.child(uid).child("votes").child(voteId).remove();
    groupDB.child(groupId).child("votes").child(voteId).remove();
    voteDB.child(voteId).remove();

    // Récupération des votes
    request.get(vote + "/users/"+uid+"/groups/"+groupId, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        res.send(JSON.parse(body));
    });

});

/**
 * Ajoute le vote d'un utilisateur
 */
router.post('/users', function(req, res){

    var idVotes = req.body.idVote;
    var uid = req.body.uid;
    var choix = req.body.choix;
    var groupId = req.body.group;
    var adejavote = false;

    voteDB.child(idVotes).once("value", function(snap){

        var my_vote = snap.val();
        // check if the user has already vote
        if(my_vote.a_vote){
            Object.keys(my_vote.a_vote).forEach(function(key){
                if(key == uid)
                    adejavote = false;
            })
        }

        // if hasnot already vote
        if(!adejavote){
            voteDB.child(idVotes).child("a_vote").child(uid).set(true);
            voteDB.child(idVotes).child("choix").once('value', function(choices){
                var all_choix = choices.val();
                for(var i = 0; i<choix.length; i++){
                    var c = choix[i];
                    if(c.reponse){
                        var nbv = all_choix[c.choix];
                        nbv = nbv + 1;
                        voteDB.child(idVotes).child("choix").child(c.choix).set(nbv);
                    }
                }

                // Récupération des votes
                request.get(vote + "/users/"+uid+"/groups/"+groupId, function optionalCallback(err, httpResponse, body) {
                    if (err) {
                        return console.error('upload failed:', err);
                    }
                    res.send(JSON.parse(body));
                });

            });
        }

    });


});

module.exports = router;