/**
 * Created by charlie on 20/12/16.
 */
var chai = require('chai');
var expect = require('chai').expect;
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);

describe('Groups', function() {

    var id;

    it('should add a group /groups POST', function(done){
        var groupTest = {
            "nom" : "testNom",
            "description" : "testDescription",
            "photoURL" : "testPhotoURL",
            "uid" : "uidTest"
        }
        chai.request(server)
            .post('/groups')
            .send(groupTest)
            .end(function(err, res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('group');
                res.body.group.should.be.a('object');
                res.body.group.should.have.property('nom');
                res.body.group.should.have.property('description');
                res.body.group.should.have.property('id');
                res.body.group.should.have.property('photoURL');
                res.body.group.should.have.property('membres');
                id = res.body.group.id;
                done();

            });
    });

    it('should list all groups /groups GET', function(done){
        chai.request(server)
            .get('/groups')
            .end(function(err, res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('groups');
                done();

            });
    });

    it('should return a group with key  /groups/:key GET', function(done){
        chai.request(server)
            .get('/groups/'+id)
            .end(function(err, res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                expect(res.body).to.have.property('group');
                expect(res.body.group).to.be.a('object');
                expect(res.body.group).to.have.property('nom');
                expect(res.body.group.nom).equal("testNom");
                done();

            });
    });


    it('should remove a specific groupe /groups/:key DELETE', function(done){
        chai.request(server)
            .delete('/groups/'+id)
            .end(function(err, res){
                res.should.have.status(200);
                chai.request(server)
                    .delete('/users/uidTest')
                    .end(function(err, res){
                        res.should.have.status(200);
                    });
                done();

            });
    });


});