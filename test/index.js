/**
 * Created by charlie on 14/12/16.
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);

describe('Index', function() {
    it('should return 200 code ', function(done){
        chai.request(server)
            .get('/')
            .end(function(err, res){
               res.should.have.status(200);
               done();
            });
    });

    it('should return 404 code', function(done){
        chai.request(server)
            .get('/badapi')
            .end(function(err, res){
                res.should.have.status(404);
                done();
            })
    })
});
