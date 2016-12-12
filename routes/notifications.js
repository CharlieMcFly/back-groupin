/**
 * Created by Charlie on 30/11/2016.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var notifDB = database.ref().child('notifications');

router.get('/', function(req, res){
   res.sendStatus(200);
});

/**
 * Ajout d'une notification pour l'amis que l'on a invité
 */
router.post('/amis', function(req, res){
    // uid de l'utilisateurs demandant l'ajout d'amis
    var uidD = req.body.uidD;
    // uid de l'utilisateurs recevant l'ajout d'amis
    var uidR = req.body.uidR;

    // Ajout d'une notification amis
    var notifDB = firebase.database().ref().child('notifications').child('amis').child(uidR);
    var demandeur = {};
    demandeur[uidD] = true;
    notifDB.set(demandeur);
    res.sendStatus(200);

});

/**
 * Récupération des notifications d'amis d'une personne
 */
router.get('/amis/:uid', function(req, res){
   notifDB.child('amis').child(req.params.uid).once('value', function(snapshot){
        res.send(snapshot.val());
    })
});

router.get('/amis/:uid/:ami', function(req, res){
    notifDB.child('amis').child(req.params.uid).child(req.params.ami).set(false);
    res.sendStatus(200);
});

module.exports = router;
