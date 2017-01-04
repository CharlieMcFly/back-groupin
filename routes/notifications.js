/**
 * Created by Charlie on 30/11/2016.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();
var notifiAmisDB = database.ref().child('notifications').child('amis');
var notifiGroupesDB = database.ref().child('notifications').child('groupes');

/// AMIS ///

/**
 * Ajout d'une notification pour l'amis que l'on a invité
 */
router.post('/amis/', function(req, res){
    // uid de l'utilisateurs demandant l'ajout d'amis
    var uidD = req.body.uidD;
    // uid de l'utilisateurs recevant l'ajout d'amis
    var uidR = req.body.uidR;

    // Ajout d'une notification amis
    notifiAmisDB.child(uidR).child(uidD).set(true);
    res.sendStatus(200);

});

/**
 * Récupération des notifications d'une personne
 */
router.get('/:uid', function(req, res){

    var uid = req.params.uid;

    notifiAmisDB.child(uid).once('value', function(snapshot){
        var nAmis = snapshot.val();
            notifiGroupesDB.child(uid).once('value', function(snap) {
                var nGroupes = snap.val();
                var n = {
                    "notifsAmis" : nAmis,
                    "notifsGroupes" : nGroupes
                };
                res.send(n);module.exports = router;
            });

    })
});

/**
 * Suppression d'une notification une fois valider
 */
router.delete('/users/:uid/friends/:ami', function(req, res){
    notifiAmisDB.child(req.params.uid).child(req.params.ami).remove();
    notifiAmisDB.child(req.params.ami).child(req.params.uid).remove();
    res.sendStatus(200);
});


/// GROUPES ///

/**
 * Notification d'ajout d'un membres
 */
router.post('/groups/', function(req, res){

    // id du groupe demandant l'ajout d'amis
    var idG = req.body.idG;
    // uid de l'utilisateurs recevant l'ajout d'amis
    var uidR = req.body.uidR;

    // Ajout d'un user dans un groupe
    notifiGroupesDB.child(uidR).child(idG).set(true);
    res.sendStatus(200);

});


/**
 * Suppression d'une notification une fois valider
 */
router.delete('/users/:uid/groups/:idgroup', function(req, res){

    notifiGroupesDB.child(req.params.uid).child(req.params.idgroup).remove();
    notifiGroupesDB.child(req.params.idgroup).child(req.params.uid).remove();
    res.sendStatus(200);

});


module.exports = router;
