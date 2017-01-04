/**
 * Created by charlie on 29/12/16.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var eventsDB = database.ref().child('events');
var groupsDB = database.ref().child('groups');
var usersDB = database.ref().child('users');
var chatsDB = database.ref().child('chats');


router.post('/', function(req, res){

    var key = req.body.id;
    if (key == undefined){
        key = chatsDB.push().key;
        chatsDB.child(key).child("id").set(key);
    }

    var uid = req.body.uid;
    var message = req.body.message;
    var groupId = req.body.groupId;

    groupsDB.child(groupId).child("messages").child(key).set(true);

    chatsDB.child(key).child("auteur").set(uid);
    chatsDB.child(key).child("message").set(message);
    chatsDB.child(key).child("date").set(firebase.database.ServerValue.TIMESTAMP);

    groupsDB.once('value', function(groups){

        chatsDB.once('value', function(msgs){

            var messages = {
                "messages" : msgs.val(),
                "groups" : groups.val()
            };
            res.send(messages);

        });

    });
});

router.get('/', function(req, res){

    chatsDB.once('value', function(msgs){

        var messages = {
            "messages" : msgs.val()
        };
        res.send(messages);

    });

});



module.exports = router;