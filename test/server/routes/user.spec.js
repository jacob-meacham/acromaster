'use strict';

var request = require('supertest');
var app = require('../../../server');

var Flow = require('../../../server/models/flow.js');
var User = require('../../../server/models/user.js');

var chai = require('chai');
chai.should();

var sinon = require('sinon');
require('mocha-sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('/api/profile', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('GET /api/profile/:userId', function() {
    it('should return an existing user', function(done) {
      var user = new User({name: 'Amelie', email: 'amelia.badelia@test.com'});
      sandbox.stub(User, 'loadPublicProfile', function(name, callback) {
        name.should.equal('amelia');
        return callback(null, user);
      });

      sandbox.stub(Flow, 'listByUser', function(user, callback) {
        return callback(null, [{name: 'Flow1'}, {name: 'Flow2'}]);
      });

      request(app)
        .get('/api/profile/amelia')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          console.log(res.body);
          res.body.name.should.equal(user.name);
          res.body.flows.should.have.length(2);
        })
        .end(done);
    });

    it('should return an error with a nonexistent user', function(done) {
      sandbox.stub(User, 'loadPublicProfile', function(name, callback) {
        return callback(null, null);
      });

      request(app)
        .get('/api/profile/name')
        .expect(500)
        .end(done);
    });

    it('should return an error if the backend errors when finding a user', function(done) {
      var error = new Error('foo');
      sandbox.stub(User, 'loadPublicProfile', function(name, callback) {
        callback(error, null);
      });

      request(app)
        .get('/api/profile/name')
        .expect(500)
        .expect(function(res) {
          res.body.error.should.equal(error.toString());
        })
        .end(done);
    });

    it('should return an error if filling out the flows errors', function(done) {
      var user = new User({name: 'Amelie', email: 'amelia.badelia@test.com'});
      sandbox.stub(User, 'loadPublicProfile', function(name, callback) {
        return callback(null, user);
      });

      var error = new Error('foo');
      console.log(error);
      sandbox.stub(Flow, 'listByUser', function(user, callback) {
        callback(error, null);
      });
      
      request(app)
        .get('/api/profile/name')
        .expect(500)
        .expect(function(res) {
          res.body.error.should.equal(error.toString());
        })
        .end(done);
    });
  });
});