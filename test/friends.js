/**
 * Created by charlie on 15/12/16.
 */
var chai = require('chai');
var expect = require('chai').expect;
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);

describe('Friends', function() {

    it('should add friends to a user on /friends POST', function(done){
        var amisTest = {
            "uidD" : "testuid3",
            "uidR" : "testuid2"
        }
        chai.request(server)
            .post('/friends')
            .send(amisTest)
            .end(function(err, res){
                res.should.have.status(200);
                done();

            });
    });

    it('should list friends of a user on /friends/:uid GET', function(done){

        var uidtest = "testuid2";
        var uidtest2 = "testuid3";

        chai.request(server)
            .get('/friends/'+uidtest)
            .end(function(err, res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('friends');
                res.body.friends.should.be.a('object');
                res.body.friends.should.have.property('testuid3');
                expect(res.body.friends.testuid3).to.be.true;
                chai.request(server)
                    .delete('/users/'+uidtest)
                    .end(function(err, res){
                        res.should.have.status(200);
                    });
                chai.request(server)
                    .delete('/users/'+uidtest2)
                    .end(function(err, res){
                        res.should.have.status(200);
                    });
                done();

            });
    });


});