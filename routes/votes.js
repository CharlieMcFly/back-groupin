/**
 * Created by charlie on 22/12/16.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
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
                                 var tabChoix = [];
                                 if(all_votes[v].choix){
                                     for(var c in all_votes[v].choix){
                                         if(all_votes[v].a_vote){
                                             var pourcent = ( all_votes[v].choix[c] / Object.keys(all_votes[v].a_vote).length ) * 100;
                                             var choixRes = {
                                                 "choix" : c,
                                                 "pourcentage" : pourcent
                                             }
                                             tabChoix.push(choixRes);
                                         }else{
                                             tabChoix.push(c);
                                         }
                                     }
                                     all_votes[v].choix = tabChoix;
                                 }
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
    var uid = req.body.createur;
    if (key == undefined){
        key = voteDB.push().key;
        voteDB.child(key).child("id").set(key);
        voteDB.child(key).child("createur").set(uid);
    }

    var groupId = req.body.group;

    voteDB.child(key).child("question").set(req.body.question);

    var choices = req.body.choix;
    for(var c in choices) {
        voteDB.child(key).child("choix").child(choices[c].choix).set(0);
    }

    groupDB.child(groupId).child("votes").child(key).set(true);

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
                                    var tabChoix = [];
                                    if(all_votes[v].choix){
                                        for(var c in all_votes[v].choix){
                                            if(all_votes[v].a_vote){
                                                var pourcent = (all_votes[v].choix[c] / Object.keys(all_votes[v].a_vote).length) * 100;
                                                var choixRes = {
                                                    "choix" : c,
                                                    "pourcentage" : pourcent
                                                }
                                                tabChoix.push(choixRes);
                                            }else{
                                                tabChoix.push(c);
                                            }
                                        }
                                        all_votes[v].choix = tabChoix;
                                    }
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
 * Supprime un vote
 */
router.delete('/:key/groups/:groupid/users/:uid', function(req, res){

    var voteId = req.params.key;
    var groupId = req.params.groupid;
    var uid = req.params.uid;

    userDB.child(uid).child("votes").child(voteId).remove();
    voteDB.child(voteId).remove();

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
                                    var tabChoix = [];
                                    if(all_votes[v].choix){
                                        for(var c in all_votes[v].choix){
                                            if(all_votes[v].a_vote){
                                                var pourcent = (all_votes[v].choix[c] / Object.keys(all_votes[v].a_vote).length) * 100;
                                                var choixRes = {
                                                    "choix" : c,
                                                    "pourcentage" : pourcent
                                                }
                                                tabChoix.push(choixRes);
                                            }else{
                                                tabChoix.push(c);
                                            }
                                        }
                                        all_votes[v].choix = tabChoix;
                                    }
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
 * Ajoute le vote d'un utilisateur
 */
router.post('/users', function(req, res){

    var idVotes = req.body.idVote;
    var uid = req.body.uid;
    var reponse = req.body.reponse;
    var groupid = req.body.group;

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
                                    var tabChoix = [];
                                    if(all_votes[v].choix){
                                        for(var c in all_votes[v].choix){
                                            if(all_votes[v].a_vote){
                                                var pourcent = (all_votes[v].choix[c] / Object.keys(all_votes[v].a_vote).length) * 100;
                                                var choixRes = {
                                                    "choix" : c,
                                                    "pourcentage" : pourcent
                                                }
                                                tabChoix.push(choixRes);
                                            }else{
                                                tabChoix.push(c);
                                            }
                                        }
                                        all_votes[v].choix = tabChoix;
                                    }
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

module.exports = router;