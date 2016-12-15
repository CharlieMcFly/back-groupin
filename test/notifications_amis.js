/**
 * Created by charlie on 15/12/16.
 */
var chai = require('chai');
var expect = require('chai').expect;
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);

describe('Notifications Amis', function() {

    /**
     * Test si l'api enregistre bien un utilisateur ou le met à jour
     */
    it('should add a SINGLE notifications_amis on /notifications_amis POST', function(done){
        var notifTest = {
            "uidD" : "testuid",
            "uidR" : "testuid2"
        }
        chai.request(server)
            .post('/notifications_amis')
            .send(notifTest)
            .end(function(err, res){
                res.should.have.status(200);
                done();

            });
    });

    /**
     * Test si l'api recupere bien les notifs amis d'un utilisateur
     */
    it('should list  notifications of a user on /notifications_amis/:uid GET', function(done){
        var useruid = "testuid2";

        chai.request(server)
            .get('/notifications_amis/'+useruid)
            .end(function(err, res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('notifs');
                res.body.notifs.should.be.a('object');
                res.body.notifs.should.have.property('testuid');
                expect(res.body.notifs.testuid).to.be.true;
                done();
            });
    });

    /**
     * Test si l'api recupere bien les notifs amis d'un utilisateur qui n'en a pas
     */
    it('should return null notifications of a fakeuser on /notifications_amis/:uid GET', function(done){
        var useruid = "fakeid";

        chai.request(server)
            .get('/notifications_amis/'+useruid)
            .end(function(err, res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('notifs');
                expect(res.body.notifs).to.be.null;
                done();
            });
    });

    /**
     * Test si l'api supprime bien la notification
     */
    it('should remove notifications of a user and another user on /notifications_amis/:uid/:ami DELETE', function(done){
        var useruid = "testuid2";
        var useruid2 = "testuid";

        chai.request(server)
            .delete('/notifications_amis/'+useruid+'/'+ useruid2)
            .end(function(err, res){
                res.should.have.status(200);
                done();
            });
    });

});
