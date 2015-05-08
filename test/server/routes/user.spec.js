'use strict';

var request = require('supertest-as-promised');
var app = require('../../../server');

var Flow = require('../../../server/models/flow.js');
var User = require('../../../server/models/user.js');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
mockgoose(mongoose);

var chai = require('chai');
chai.should();

var sinon = require('sinon');
require('mocha-sinon');
require('sinon-as-promised');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('/api/profile', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    mockgoose.reset();
  });

  afterEach(function() {
    sandbox.restore();
  });

  var stubLoadUserProfile = function() {
    var user = new User({name: 'Amelia', email: 'amelia.badelia@test.com', favorites: []});
    user.addFavorite('flow1');
    user.addFavorite('flow2');

    var profile = {
      id: user._id,
      name: user.name,
      username: user.username,
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.createdAt,
      favorites: user.favorites
    };

    sandbox.stub(User, 'loadPublicProfile', function(name, callback) {
      name.should.equal('amelia');
      return callback(null, profile);
    });

    return profile;
  };

  describe('/:userId', function() {
    it('should return an existing user', function() {
      var profile = stubLoadUserProfile();
      sandbox.stub(Flow, 'listByUser').resolves([{name: 'Flow1'}, {name: 'Flow2'}]);

      return request(app)
        .get('/api/profile/amelia')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          res.body.name.should.equal(profile.name);
          res.body.flows.should.have.length(2);
        });
    });

    it('should return an error with a nonexistent user', function() {
      sandbox.stub(User, 'loadPublicProfile', function(name, callback) {
        return callback(null, null);
      });

      return request(app)
        .get('/api/profile/name')
        .expect(404);
    });

    it('should return an error if the backend errors when finding a user', function() {
      var error = new Error('foo');
      sandbox.stub(User, 'loadPublicProfile', function(name, callback) {
        callback(error, null);
      });

      return request(app)
        .get('/api/profile/name')
        .expect(500)
        .expect(function(res) {
          res.body.error.should.equal(error.toString());
        });
    });

    it('should return an error if filling out the flows errors', function() {
      stubLoadUserProfile();

      var error = new Error('foo');
      sandbox.stub(Flow, 'listByUser').rejects(error);
      
      return request(app)
        .get('/api/profile/amelia')
        .expect(500)
        .expect(function(res) {
          res.body.error.should.equal(error.toString());
      });
    });
  });

  describe('/:user/flows', function() {
    it('should return the flows for the user', function() {
      stubLoadUserProfile();
      sandbox.stub(Flow, 'listByUser').resolves(['flow1', 'flow2']);

      return request(app)
        .get('/api/profile/amelia/flows')
        .expect(200)
        .expect(function(res) {
          res.body.flows.should.have.length(2);
          res.body.flows.should.eql(['flow1', 'flow2']);
      });
    });
  });

  describe('/:user/favorites', function() {
    it('should return the favorites of the user', function() {
      var profile = stubLoadUserProfile();

      return request(app)
        .get('/api/profile/amelia/favorites')
        .expect(200)
        .expect(function(res) {
          res.body.favorites.should.have.length(2);
          res.body.favorites[0].flow.should.eql(profile.favorites[0].flow);
      });
    });

    it('should allow adding/removing a favorite', function() {

    });

    it('should not allow adding/removing a favorite if the user does not match', function() {

    });

    it('should allow querying for a favorite', function() {
      stubLoadUserProfile();

      // return request(app)
      //   .get('/api/profile/amelia/favorites/flow1')
      //   .expect(200)
      //   .expect(function(res) {
      //     res.body.hasFavorited.to.be.true;
      // }).then(function() {
      //   return request(app)
      //     .get('/api/profile/amelia/favorites/notAFlow')
      //     .expect(200)
      //     .expect(function(res) {
      //       res.body.hasFavorited.to.be.false;
      //     });
      // });
    });

    it('should return an error if querying for a favorite returns an error', function() {
    //   sandbox.stub(User, 'find', function(query, cb) {
    //     console.log('in the stub yo');
    //     cb('find error');
    //   });

    //   return request(app)
    //     .get('/api/profile/amelia/favorites/flow1')
    //     .expect(500);
    // });
  });
});