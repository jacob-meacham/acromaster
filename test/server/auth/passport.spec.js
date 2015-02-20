'use strict';

var mongoose = require('mongoose');
require('../../../server/models/user.js');

var chai = require('chai');
chai.should();
var expect = chai.expect;

require('sinon');
require('mocha-sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var User = mongoose.model('User');
var passport = require('../../../server/config/passport.js');

var testError = function(sinon, passportCallback, done) {
  var spy = sinon.spy();
  var stub = sinon.stub(mongoose.Model, 'findOne', function(query, callback) {
    callback('An error occurred', null);
  });

  passportCallback('accessToken', 'refreshToken', {id: '0'}, spy);
  
  stub.should.have.been.callCount(1);
  spy.should.have.been.calledWith('An error occurred');
  done();
};

var testReturnUser = function(sinon, expectedIdQuery, passportCallback, done) {
  var user = new User();

  var spy = sinon.spy();
  var stub = sinon.stub(mongoose.Model, 'findOne', function(query, callback) {
    query.should.have.property(expectedIdQuery);
    callback(null, user);
  });

  passportCallback('accessToken', 'refreshToken', {id: 'abc123'}, spy);

  stub.should.have.been.callCount(1);
  spy.should.have.been.calledWith(null, user);
  done();
};

var testCreateUser = function(sinon, profile, passportCallback, saveCallback) {
  var spy = sinon.spy();
  var findStub = sinon.stub(mongoose.Model, 'findOne', function(query, callback) {
    callback(null, null);
  });
  
  sinon.stub(mongoose.Model.prototype, 'save', function(callback) {
    callback(null);
    findStub.should.have.been.callCount(1);
    spy.should.have.been.callCount(1);
    saveCallback(spy.args[0][1]);
  });

  passportCallback('accessToken', 'refreshToken', profile, spy);
};

var testCreateUserError = function(sinon, profile, passportCallback, done) {
  var spy = sinon.spy();
  var findStub = sinon.stub(mongoose.Model, 'findOne', function(query, callback) {
    callback(null, null);
  });
  
  sinon.stub(mongoose.Model.prototype, 'save', function(callback) {
    callback('An error occurred');
    
    findStub.should.have.been.callCount(1);
    spy.should.have.been.callCount(1);
    spy.should.have.been.calledWith('An error occurred');
    done();
  });

  passportCallback('accessToken', 'refreshToken', profile, spy);
};

var extraJson = {
  a: 'b',
  c: 'd'
};

var googleProfile = {
  displayName: 'jemonjam',
  emails: [{value: 'a@b.com'}, {value:'c@d.com'}],
  _json: extraJson
};

var facebookProfile = {
  displayName: 'jemonjam',
  emails: [{value: 'a@b.com'}, {value:'c@d.com'}],
  username: 'jemonjam',
  _json: extraJson
};

var twitterProfile = {
  displayName: 'jemonjam',
  username: 'jemonjam',
  _json: extraJson
};

describe('Passport', function() {
  describe('deserializeUser', function() {
    it('should not return a user with an invalid id', function(done) {
      passport._deserializeUser(0, function(user) {
        expect(user).to.not.exist();
        done();
      });
    });
  });

  describe('Facebook strategy', function() {
    it('should return a user with a facebook provider', function(done) {
      testReturnUser(this.sinon, 'facebook.id', passport._facebookCallback, done);
    });

    it('should create a user with a facebook provider', function(done) {
      testCreateUser(this.sinon, facebookProfile, passport._facebookCallback, function(user) {
        user.email.should.equal('a@b.com');
        user.username.should.equal('jemonjam');
        user.name.should.equal('jemonjam');
        user.provider.should.equal('facebook');
        user.facebook.should.equal(extraJson);
        done();
      });
    });

    it('should return an error if the query returns an error', function(done) {
      testError(this.sinon, passport._facebookCallback, done);
    });

    it('should return an error if it cannot save a new user', function(done) {
      testCreateUserError(this.sinon, facebookProfile, passport._facebookCallback, done);
    });
  });

  describe('Twitter strategy', function() {
    it('should return a user with a twitter provider', function(done) {
      testReturnUser(this.sinon, 'twitter.id_str', passport._twitterCallback, done);
    });

    it('should create a user with a twitter provider', function(done) {
      testCreateUser(this.sinon, twitterProfile, passport._twitterCallback, function(user) {
        user.username.should.equal('jemonjam');
        user.name.should.equal('jemonjam');
        user.provider.should.equal('twitter');
        user.twitter.should.equal(extraJson);
        done();
      });
    });

    it('should return an error if the query returns an error', function(done) {
      testError(this.sinon, passport._twitterCallback, done);
    });

    it('should return an error if it cannot save a new user', function(done) {
      testCreateUserError(this.sinon, twitterProfile, passport._twitterCallback, done);
    });
  });

  describe('Google strategy', function() {
    it('should return a user with a google provider', function(done) {
      testReturnUser(this.sinon, 'google.id', passport._googleCallback, done);
    });

    it('should create a user with a google provider', function(done) {
      testCreateUser(this.sinon, googleProfile, passport._googleCallback, function(user) {
        user.name.should.equal('jemonjam');
        user.email.should.equal('a@b.com');
        user.provider.should.equal('google');
        user.google.should.equal(extraJson);
        done();
      });
    });

    it('should return an error if the query returns an error', function(done) {
      testError(this.sinon, passport._googleCallback, done);
    });

    it('should return an error if it cannot save a new user', function(done) {
      testCreateUserError(this.sinon, googleProfile, passport._googleCallback, done);
    });
  });
});
