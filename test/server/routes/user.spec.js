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
var expect = chai.expect;

var Bluebird = require('bluebird');
var sinon = require('sinon');
require('mocha-sinon');
require('sinon-as-promised')(Bluebird);
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('/api/profile', function() {
  var sandbox;
  var user;
  beforeEach(function(done) {
    sandbox = sinon.sandbox.create();
    mockgoose.reset();

    user = new User({name: 'Amelia', email: 'amelia.badelia@test.com', favorites: []});
    user.save(done);
  });

  afterEach(function() {
    sandbox.restore();
  });

  var stubLoadUserProfile = function() {
    var profile = {
      id: user._id,
      name: user.name,
      username: user.username,
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.createdAt,
      favorites: user.favorites
    };

    sandbox.stub(User, 'loadPublicProfile').resolves(profile);
    return profile;
  };

  describe('/:userId', function() {
    it('should return an existing user', function() {
      var profile = stubLoadUserProfile();

      return request(app)
        .get('/api/profile/amelia')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          res.body.name.should.equal(profile.name);
        });
    });

    it('should return an error with a nonexistent user', function() {
      sandbox.stub(User, 'loadPublicProfile').resolves(null);

      return request(app)
        .get('/api/profile/name')
        .expect(404);
    });

    it('should return an error if the backend errors when finding a user', function() {
      var error = new Error('foo');
      sandbox.stub(User, 'loadPublicProfile').rejects(error);

      return request(app)
        .get('/api/profile/name')
        .expect(500)
        .expect(function(res) {
          res.body.error.should.equal(error.toString());
        });
    });
  });

  describe('/:user/flows', function() {
    it('should return the flows for the user', function() {
      var profile = stubLoadUserProfile();
      var listStub = sandbox.stub(Flow, 'listByUser').resolves(['flow1', 'flow2']);
      sandbox.stub(Flow, 'countByUser').resolves(2);

      return request(app)
        .get('/api/profile/amelia/flows')
        .expect(200)
        .expect(function(res) {
          listStub.should.have.callCount(1);
          listStub.getCall(0).args[0].should.eql(profile.id);
          listStub.getCall(0).args[1].should.eql({max: 100, page: 0});
          res.body.flows.should.have.length(2);
          res.body.flows.should.eql(['flow1', 'flow2']);
      }).then(function() {
        return request(app)
          .get('/api/profile/amelia/flows')
          .query({max: 10, page: 2})
          .expect(200)
          .expect(function(res) {
            // Stubbing, so the paging won't work
            listStub.getCall(1).args[1].should.eql({max: '10', page: 1});
            res.body.page.should.eql(2);
        });
      });
    });
  });

  describe('/:user/favorites', function() {
    var carolAuthedApp;
    var ameliaAuthedApp;

    var flow;

    before(function(done) {
      var _flow = {
        name: 'Flow 1',
        createdAt: '12/10/1990'
      };
      flow = new Flow(_flow);
      flow.save(done);
    });

    beforeEach(function() {
      carolAuthedApp = require('./utils/authedApp')(app).withUser(new User({username: 'carol', name: 'carol'}));
      ameliaAuthedApp = require('./utils/authedApp')(app).withUser(user);
    });

    it('should return the favorites of the user', function() {
      var profile = stubLoadUserProfile();

      user.addFavorite('flow1');
      user.addFavorite('flow2');

      return user.saveAsync().then(function() {
        return request(app)
          .get('/api/profile/amelia/favorites')
          .expect(200)
          .expect(function(res) {
            res.body.favorites.should.have.length(2);
            res.body.favorites[0].flow.should.eql(profile.favorites[0].flow);
          });
      });
    });

    it('should allow adding/removing a favorite', function() {
      return request(ameliaAuthedApp)
        .post('/api/profile/amelia/favorites/' + flow._id)
        .expect(200)
        .expect(function(res) {
          res.body.favorites.should.have.length(1);
          res.body.favorites[0].flow.should.eql(flow._id);
        }).then(function() {
          return request(ameliaAuthedApp)
            .delete('/api/profile/amelia/favorites/' + flow._id)
            .expect(200)
            .expect(function(res) {
              expect(res.body.favorites).to.be.empty;
            });
        });
    });

    it('should not allow adding/removing a favorite if the user does not match', function() {
      // Unauthenticated add
      return request(app)
        .post('/api/profile/amelia/favorites/flow1')
        .expect(401).then(function() {
          // Unauthenticated remove
          return request(app)
            .delete('/api/profile/amelia/favorites/flow1')
            .expect(401);
        }).then(function() {
          // Mismatch add
          return request(carolAuthedApp)
            .post('/api/profile/amelia/favorites/flow1')
            .expect(401);
        }).then(function() {
          return request(carolAuthedApp)
            .delete('/api/profile/amelia/favorites/flow1')
            .expect(401);
        });
    });

    it('should allow querying for a favorite', function() {
      user.addFavorite('flow1');

      return user.saveAsync().then(function() {
        return request(app)
          .get('/api/profile/amelia/favorites/flow1')
          .expect(200)
          .expect(function(res) {
            res.body.hasFavorited.should.be.true;
          }).then(function() {
            return request(app)
              .get('/api/profile/amelia/favorites/notAFlow')
              .expect(200)
              .expect(function(res) {
                res.body.hasFavorited.should.be.false;
            });
        }).then(function() {
          return request(app)
            .get('/api/profile/noUser/favorites/notAFlow')
            .expect(200)
            .expect(function(res) {
              res.body.hasFavorited.should.be.false;
            });
        });
      });
    });

    it('should return an error if querying for a favorite returns an error', function() {
      sandbox.stub(User, 'findOne', function(query, cb) {
        cb('find error');
      });

      return request(app)
        .get('/api/profile/amelia/favorites/flow1')
        .expect(500);
    });

    it('should return an error if adding or removing returns an error', function() {
      sandbox.stub(user, 'addFavorite').rejects('no favorite');
      sandbox.stub(user, 'removeFavorite').rejects('no favorite');

      return request(ameliaAuthedApp)
        .post('/api/profile/amelia/favorites/flow1')
        .expect(500)
        .expect(function(res) {
          res.body.error.should.match(/no favorite/);
        }).then(function() {
          return request(ameliaAuthedApp)
            .delete('/api/profile/amelia/favorites/flow1')
            .expect(500)
            .expect(function(res) {
              res.body.error.should.match(/no favorite/);
            });
        });
    });
  });
});