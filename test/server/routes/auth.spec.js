'use strict';

var request = require('supertest-as-promised');
var app = require('../../../server');
var passportStub = require('passport-stub');
var mongoose = require('mongoose');
require('../../../server/models/user');

var chai = require('chai');
chai.should();

var sinon = require('sinon');
var User = mongoose.model('User');

describe('/auth', function() {
  var sandbox;
  var user;

  before(function() {
    user = new User({
      name: 'jemonjam',
      email: 'jemonjam@jemonjam.com',
    });

    sandbox = sinon.sandbox.create();

    passportStub.install(app);
  });

  beforeEach(function() {
    sandbox.restore();
  });

  afterEach(function() {
    passportStub.logout();
  });

  describe('GET /auth/loggedin', function() {
    it('should return 0 when no user is logged in', function() {
      return request(app)
        .get('/auth/loggedin')
        .expect(200)
        .expect(0);
    });

    it('should return the user object when a user is logged in', function() {
      var _user = new User(user);
      passportStub.login(_user);
      return request(app)
        .get('/auth/loggedin')
        .expect(200)
        .expect(function(res) {
          res.body.name.should.equal(_user.name);
          res.body.email.should.equal(_user.email);
        });
    });
  });

  describe('GET /auth/currentUser', function() {
    it('should return null when no user is logged in', function() {
      return request(app)
        .get('/auth/currentUser')
        .expect(200)
        .expect({});
    });

    it('should return the current user when a user is logged in ', function() {
      var _user = new User(user);
      passportStub.login(_user);
      return request(app)
        .get('/auth/loggedin')
        .expect(200)
        .expect(function(res) {
          res.body.name.should.equal(_user.name);
          res.body.email.should.equal(_user.email);
        });
    });
  });

  describe('GET /logout', function() {
    it('should redirect if no user is logged in', function() {
      return request(app)
        .get('/logout')
        .expect(function(res) {
          res.header.location.should.equal('/');
        });
    });

    it('should redirect and logout user if user is logged in', function() {
      var _user = new User(user);
      passportStub.login(_user);
      return request(app)
        .get('/auth/loggedin')
        .expect(200)
        .expect(function(res) {
          res.body.name.should.equal(_user.name);
        }).then(function() {
          return request(app)
            .get('/logout')
            .expect(function(res) {
              res.header.location.should.equal('/');
            });
        }).then(function() {
          request(app)
            .get('/auth/loggedin')
            .expect(200)
            .expect(0);
        });
    });
  });

  describe('Passport internal', function() {
    var auth = require('../../../server/routes/auth');
    var res;
    var req;

    beforeEach(function() {
      res = {
        redirect: function() {}
      };
      
      req = {
        isAuthenticated: function() { return true; }
      };
    });

    it('should redirect to /', function() {
      var redirectSpy = sandbox.spy(res, 'redirect');
      auth._authCallback(req, res);

      redirectSpy.should.have.been.calledWith('/');
    });

    it('should redirect to / when already logged in', function() {
      var redirectSpy = sandbox.spy(res, 'redirect');
      var isAuthenticatedSpy = sandbox.spy(req, 'isAuthenticated');
      auth._login(req, res);
      
      isAuthenticatedSpy.should.have.callCount(1);
      redirectSpy.should.have.been.calledWith('/');
    });

    it('should redirect to /login when not logged in', function() {
      req.isAuthenticated = function() { return false; };
      
      var redirectSpy = sandbox.spy(res, 'redirect');
      var isAuthenticatedSpy = sandbox.spy(req, 'isAuthenticated');
      auth._login(req, res);
      
      isAuthenticatedSpy.should.have.callCount(1);
      redirectSpy.should.have.been.calledWith('/login');
    });
  });
});
