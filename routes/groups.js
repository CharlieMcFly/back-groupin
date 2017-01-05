/**
 * Created by charlie on 20/12/16.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var userDB = database.ref().child('users');
var groupDB = database.ref().child('groups');

// ALL OK NEED TESTS 4/01/2017

/**
 * Renvoie tous les groupes
 */
router.get('/', function(req, res){

    groupDB.once('value', function(snapshot){
        var g = {"groups" : snapshot.val()};
        res.send(g);
    })

});

/**
 * Renvoie les groupes d'un utilisateur
 */
router.get('/:uid', function(req, res){
    userDB.child(req.params.uid).once('value', function(user){
        groupDB.once('value', function(groups){
            var all_groups = groups.val();
            var groupsRes = [];
            if(all_groups){
                var my_user = user.val();
                if(my_user){
                    if(my_user.groups){
                        for(var g in my_user.groups){
                            if(all_groups[g]){
                                groupsRes.push(all_groups[g]);
                            }
                        }
                    }
                }
            }
            var result = {
                "groups" : groupsRes
            };
            res.send(result);
        });
    });
});

/**
 * Créer un groupe et le renvoie
 */
router.post('/', function(req, res) {

    var key = req.body.id;
    var uid = req.body.uid;

    if (key == undefined){
        key = groupDB.push().key;
        groupDB.child(key).child("id").set(key);
    }

    groupDB.child(key).child("nom").set(req.body.nom);
    groupDB.child(key).child("description").set(req.body.description);
    groupDB.child(key).child("photoURL").set(req.body.photoURL);
    groupDB.child(key).child("membres").child(uid).set(true);
    userDB.child(uid).child("groups").child(key).set(true);

    userDB.child(uid).once('value', function(user){
        groupDB.once('value', function(groups){
            var all_groups = groups.val();
            var groupsRes = [];
            if(all_groups){
                var my_user = user.val();
                if(my_user){
                    if(my_user.groups){
                        for(var g in my_user.groups){
                            if(all_groups[g]){
                                groupsRes.push(all_groups[g]);
                            }
                        }
                    }
                }
            }
            var result = {
                "user" : my_user,
                "groups" : groupsRes
            };
            res.send(result);
        });
    });
});


module.exports = router;





