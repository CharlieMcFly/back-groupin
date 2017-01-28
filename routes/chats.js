/**
 * Created by charlie on 29/12/16.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var eventDB = database.ref().child('events');
var groupDB = database.ref().child('groups');
var userDB = database.ref().child('users');
var chatDB = database.ref().child('chats');

/**
 * Récupérer le chat d'un groupe
 */
router.get('/users/:uid/groups/:key', function(req, res){

    var uid = req.params.uid;
    var groupid = req.params.key;

    groupDB.child(groupid).once("value", function(group){
        userDB.once("value", function(users){
            chatDB.once('value', function(msgs){
                var all_messages = msgs.val();
                var my_group = group.val();
                var all_users = users.val();
                var my_user = all_users[uid];
                var tabMsg = [];
                if(my_group){
                    if(all_messages){
                        if(my_group.messages){
                            for(var m in my_group.messages){
                                if(all_messages[m]){
                                    if(all_users){
                                        if(all_users[all_messages[m].auteur]){
                                            all_messages[m].auteur = all_users[all_messages[m].auteur];
                                        }
                                    }
                                    all_messages[m].date = new Date(all_messages[m].date).getTime();
                                    tabMsg.push(all_messages[m]);
                                }
                            }
                        }
                    }
                }
                var result = {
                    "user" : my_user,
                    "messages" : tabMsg
                };
                res.send(result);
            });
        });
    });


});

/**
 * Poster un message
 */
router.post('/', function(req, res){

    var key = req.body.id;
    if (key == undefined){
        key = chatDB.push().key;
        chatDB.child(key).child("id").set(key);
    }

    var uid = req.body.uid;
    var message = req.body.message;
    var groupId = req.body.groupId;

    groupDB.child(groupId).child("messages").child(key).set(true);

    chatDB.child(key).child("auteur").set(uid);
    chatDB.child(key).child("message").set(message);
    chatDB.child(key).child("date").set(firebase.database.ServerValue.TIMESTAMP);

    groupDB.child(groupId).once("value", function(group){
        userDB.once("value", function(users){
            chatDB.once('value', function(msgs){
                var all_messages = msgs.val();
                var my_group = group.val();
                var all_users = users.val();
                var my_user = all_users[uid];
                var tabMsg = [];
                if(my_group){
                    if(all_messages){
                        if(my_group.messages){
                            for(var m in my_group.messages){
                                if(all_messages[m]){
                                    if(all_users){
                                        if(all_users[all_messages[m].auteur]){
                                            all_messages[m].auteur = all_users[all_messages[m].auteur];
                                        }
                                    }
                                    all_messages[m].date = new Date(all_messages[m].date).getTime();
                                    tabMsg.push(all_messages[m]);
                                }
                            }
                        }
                    }
                }
                var result = {
                    "user" : my_user,
                    "messages" : tabMsg
                };
                res.send(result);
            });
        });
    });
});

module.exports = router;