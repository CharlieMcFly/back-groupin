/**
 * Created by Charlie on 30/11/2016.
 */
var express = require('express');
var router = express.Router();
var firebase = require('../firebase/firebase.js');
var database = firebase.database();

router.post("/friends", function(){
    // uid de l'utilisateurs demandant l'ajout d'amis
    // uid de l'utilisateurs envoyant l'ajout d'amis
    // ajout de l'amis et suppression de la notif

    // suppression de la notification

});



module.exports = router;
