/**
 * Created by charlie on 14/11/16.
 */
var firebase = require('firebase');
// Initialize Firebase
var config = {
    apiKey: "AIzaSyCLbSzDmmWXZRlJ8U6n6x14AcdgmanuwQ0",
    authDomain: "groupin-146311.firebaseapp.com",
    databaseURL: "https://groupin-146311.firebaseio.com",
    storageBucket: "groupin-146311.appspot.com",
    messagingSenderId: "786170456164"
};
firebase.initializeApp(config);

module.exports = firebase;