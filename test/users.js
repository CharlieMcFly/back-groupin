/**
 * Created by charlie on 14/12/16.
 */
var chai = require('chai');
var expect = require('chai').expect;
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);


describe('Users', function() {

    /**
     * Test si l'api renvoie bien un object avec des utilisateurs
     */
    it('should list ALL user on /users GET', function(done){

        chai.request(server)
            .get('/users')
            .end(function(err, res){
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('users');
                res.body.users.should.be.a('object');
                done();
            });

    });

    /**
     * Test si l'api enregistre bien un utilisateur ou le met à jour
     */
    it('should add a SINGLE user on /users POST', function(done){
        var userTest = {
            "displayName" : "test",
            "email" : "test@test.be",
            "providerId" : "test.com",
            "photoURL" : "testURL",
            "uid" : "testuid"
        }
        chai.request(server)
            .post('/users')
            .send(userTest)
            .end(function(err, res){
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('user');
                res.body.user.should.be.a('object');
                res.body.user.should.have.property('displayName');
                res.body.user.should.have.property('email');
                res.body.user.should.have.property('providerId');
                res.body.user.should.have.property('photoURL');
                res.body.user.should.have.property('uid');
                expect(res.body.user.displayName).to.be.equal('test');
                expect(res.body.user.email).to.be.equal('test@test.be');
                expect(res.body.user.providerId).to.be.equal('test.com');
                expect(res.body.user.photoURL).to.be.equal('testURL');
                expect(res.body.user.uid).to.be.equal('testuid');
                done();

            });
    });

    it('should add friends to a user on /users/friends POST');

    /**
     * Test si l'api renvoie bien un object avec l'utilisateur
     */
    it('should list a SINGLE user on /users/:uid GET', function(done){

        var id_creator = "testuid";

        chai.request(server)
            .get('/users/'+ id_creator)
            .end(function(err, res){
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('user');
                res.body.user.should.be.a('object');
                res.body.user.should.have.property('displayName');
                res.body.user.should.have.property('email');
                res.body.user.should.have.property('providerId');
                res.body.user.should.have.property('photoURL');
                res.body.user.should.have.property('uid');
                expect(res.body.user.displayName).to.be.equal('test');
                expect(res.body.user.email).to.be.equal('test@test.be');
                expect(res.body.user.providerId).to.be.equal('test.com');
                expect(res.body.user.photoURL).to.be.equal('testURL');
                expect(res.body.user.uid).to.be.equal('testuid');
                done();
            });
    });

    /**
     * Test si l'api renvoie bien un object vide si l'utilisateur n'existe pas
     */
    it('should empty object /users/:uid GET', function(done){

        var id_creator = "fakeid";

        chai.request(server)
            .get('/users/'+ id_creator)
            .end(function(err, res){
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('user');
                done();
            });
    });

    /**
     * Test si l'api supprime un utilisateur
     */
    it('should remove /users/:uid DELETE', function(done){

        var id_creator = "testuid";

        chai.request(server)
            .delete('/users/'+ id_creator)
            .end(function(err, res){
                res.should.have.status(200);
                done();
            });
    });




});
