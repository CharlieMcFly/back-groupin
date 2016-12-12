/**
 * Created by Charlie on 30/11/2016.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var notifiAmisDB = database.ref().child('notifications').child('amis');

router.get('/', function(req, res){
   res.sendStatus(200);
});

/**
 * Ajout d'une notification pour l'amis que l'on a invité
 */
router.post('/', function(req, res){
    // uid de l'utilisateurs demandant l'ajout d'amis
    var uidD = req.body.uidD;
    // uid de l'utilisateurs recevant l'ajout d'amis
    var uidR = req.body.uidR;

    // Ajout d'une notification amis
    notifiAmisDB.child(uidR).child(uidD).set(true);
    res.sendStatus(200);

});

/**
 * Récupération des notifications d'amis d'une personne
 */
router.get('/:uid', function(req, res){
    notifiAmisDB.child(req.params.uid).once('value', function(snapshot){
        res.send(snapshot.val());
    })
});

/**
 * Suppression d'une notification une fois valider
 */
router.get('/:uid/:ami', function(req, res){
    notifiAmisDB.child(req.params.uid).child(req.params.ami).remove();
    res.sendStatus(200);
});

module.exports = router;
