/**
 * Created by charlie on 20/12/16.
 */
var express = require('express');
var router = express.Router();
var request = require('request');
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var userDB = database.ref().child('users');
var groupDB = database.ref().child('groups');

// ALL OK NEED TESTS 4/01/2017

/**
 * Renvoie les groupes d'un utilisateur
 */
router.get('/:uid', function(req, res){
    userDB.child(req.params.uid).once('value', function(user){
        groupDB.once('value', function(groups){
            var all_groups = groups.val();
            var groupsRes = [];
            var my_user = user.val();
            if(all_groups){
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

    key = key.replace(/-|_/g, "").toLowerCase();
    /*
    // Créer le compte du groupe + ajout du user
    var params = {
        "name" : req.body.nom,
        "id" : key,
        "password" : key,
        "contact_email" : req.body.email
    };
    request.post({url:'https://ihatemoney.org/api/projects', formData: params}, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Successful!  Server responded with:', body);
        // Ajouter le user au groupe
        params = {"name" : uid};
        request.post({url:'https://ihatemoney.org/api/projects/'+key+'/members', formData: params,
                'auth': {
                    'user': key,
                    'pass': key
                }},
            function optionalCallback(err, httpResponse, body) {
                if (err) {
                    return console.error('upload failed:', err);
                }
                console.log('Successful!  Server responded with:', body);
            });
    });
    */

    // Renvoie le user et ses groupes
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

/**
 * Ajouter une photo au groupe
 */
router.post('/photo', function(req, res){

    var idgroup = req.body.key;
    var url = req.body.url;

    groupDB.child(idgroup).child("photos").once("value", function(photos){

        var all_photo = photos.val();
        if(all_photo){
            var nbPhoto = Object.keys(all_photo).length;
            groupDB.child(idgroup).child("photos").child(nbPhoto).set(url);
        }else{
            groupDB.child(idgroup).child("photos").child(0).set(url);
        }

    });


    groupDB.child(idgroup).once("value", function(group){
        var result = {
           "group" : group.val()
        };
        res.send(result);
    });


});




module.exports = router;





