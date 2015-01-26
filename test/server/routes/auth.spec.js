'use strict';

var request = require('supertest');
var app = require('../../../server');
var passportStub = require('passport-stub');
var mongoose = require('mongoose');
require('../../../server/models/user.js');

var chai = require('chai');

chai.should();
var expect = chai.expect;


var User = mongoose.model('User');
var user;

describe('/auth', function() {
  before(function(done) {
    user = new User({
      name: 'jemonjam',
      username: 'jemonjam',
      email: 'jemonjam@jemonjam.com',
    });

    passportStub.install(app);
    done();
  });

  afterEach(function(done) {
    passportStub.logout();
    done();
  });

  describe('GET /auth/loggedin', function() {
    it('should return 0 when no user is logged in', function(done) {
      request(app)
        .get('/auth/loggedin')
        .expect(200)
        .expect(0, done);
    });

    it('should return the user object when a user is logged in', function(done) {
      var _user = new User(user);
      passportStub.login(_user);
      request(app)
        .get('/auth/loggedin')
        .expect(200)
        .expect(function(res) {
          res.body.name.should.equal(_user.name);
          res.body.username.should.equal(_user.username);
        })
        .end(done);
    });
  });

  describe('GET /auth/currentUser', function() {
    it('should return null when no user is logged in', function(done) {
      request(app)
        .get('/auth/currentUser')
        .expect(200)
        .expect({}, done);
    });

    it('should return the current user when a user is logged in ', function(done) {
      var _user = new User(user);
      passportStub.login(_user);
      request(app)
        .get('/auth/loggedin')
        .expect(200)
        .expect(function(res) {
          res.body.name.should.equal(_user.name);
          res.body.username.should.equal(_user.username);
        })
        .end(done);
    });
  });

  describe('GET /logout', function() {
    it('should redirect if no user is logged in', function(done) {
      request(app)
        .get('/logout')
        .end(function(err, res) {
          expect(err).to.not.exist();
          res.header.location.should.equal('/');
          done();
        });
    });

    it('should redirect and logout user if user is logged in', function(done) {
      var _user = new User(user);
      passportStub.login(_user);
      request(app)
        .get('/auth/loggedin')
        .expect(200)
        .expect(function(res) {
          res.body.name.should.equal(_user.name);
        });

      request(app)
        .get('/logout')
        .end(function(err, res) {
          expect(err).to.not.exist();
          res.header.location.should.equal('/');
        });

      request(app)
        .get('/auth/loggedin')
        .expect(200)
        .expect(0, done);
    });
  });
});
