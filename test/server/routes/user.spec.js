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

      sandbox.stub(Flow, 'listByUser').returns({});

      request(app)
        .get('/api/profile/amelia')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          res.body.user.name.should.equal(user.name);
          res.body.user.flows.should.be.empty();
        })
        .end(done);
    });

    it('should return an error with a nonexistent user', function(done) {
      sandbox.stub(User, 'loadPublicProfile').returns(null);

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
          res.body.error.should.equal(error);
        })
        .end(done);
    });

    it('should fill out the flows', function(done) {
      var user = new User({name: 'Amelie', email: 'amelia.badelia@test.com'});
      sandbox.stub(User, 'loadPublicProfile', function(name, callback) {
        return callback(null, user);
      });

      sandbox.stub(Flow, 'listByUser').returns({});

      request(app)
        .get('/api/profile/name')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          res.body.user.name.should.equal(user.name);
          res.body.user.flows.should.equal(flows);
        })
        .end(done);
    });

    it('should return an error if filling out the flows errors', function(done) {
      var user = new User({name: 'Amelie', email: 'amelia.badelia@test.com'});
      sandbox.stub(User, 'loadPublicProfile', function(name, callback) {
        return callback(null, user);
      });

      var error = new Error('foo');
      sandbox.stub(Flow, 'listByUser', function(user, callback) {
        callback(error, null);
      });
      
      request(app)
        .get('/api/profile/name')
        .expect(500)
        .expect(function(res) {
          res.body.error.should.equal(error);
        })
        .end(done);
    });
  });
});