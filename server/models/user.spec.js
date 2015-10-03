'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var chai = require('chai');
var sinon = require('sinon');
var User = require('../../../server/models/user');

Promise.promisifyAll(mongoose);
mockgoose(mongoose);

chai.should();
var expect = chai.expect;

var user1, user2;
var sandbox;

describe('User Model', function() {
  before(function() {
    user1 = {
      _id: 'eWEKaVNO',
      name: 'Full Name',
      email: 'test.foo@test.com',
      provider: 'twitter'
    };

    user2 = {
      _id: 'boetLdeZ',
      name: 'Full Name 2',
      email: 'test.bar@test.com',
      provider: 'google'
    };
  });

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    mockgoose.reset();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('save()', function() {
    it('should save without error', function(done) {
      var _user = new User(user1);
      _user.save(function(err) {
        expect(err).to.not.exist;
        _user.remove(done());
      });
    });

    it('should be able to update user without error', function(done) {
      var _user = new User(user1);
      _user.save(function(err) {
        expect(err).to.not.exist;

        _user.name = 'Bodhi Man';
        _user.save(function(err, result) {
          expect(err).to.not.exist;
          result.name.should.equal('Bodhi Man');
          done();
        });
      });
    });

    it('should fail to save an existing user with the same email', function(done) {
      var _user1 = new User(user1);
      var _user2 = new User(user1);

      _user1.save(function() {
        _user2.save(function(err) {
          expect(err).to.exist;
          done();
        });
      });
    });

    it('should show an error when trying to save without name', function(done) {
      var _user = new User(user1);
      _user.name = '';

      _user.save(function(err) {
        expect(err).to.exist;
        done();
      });
    });

    it('should save a slugified version of the name', function(done) {
      var _user = new User(user2);
      _user.save(function(err, result) {
        expect(err).to.not.exist;
        result.username.should.equal('full-name-2');
        done();
      });
    });
  });

  describe('loadPublicProfile()', function() {
    it('should load a user by name', function() {
      var _user = new User(user1);
      return _user.saveAsync().then(function() {
        return User.loadPublicProfile(_user.username);
      }).then(function(loaded_user) {
        loaded_user.name.should.equal(_user.name);
      });
    });

    it('should not load a nonexistent user', function() {
      return User.loadPublicProfile('johnny-boy-11').then(function(user) {
        expect(user).to.not.exist;
      });
    });

    it('should load only public information', function() {
      var _user = new User(user1);
      return _user.saveAsync().then(function() {
        return User.loadPublicProfile(_user.username);
      }).then(function(loaded_user) {
        expect(loaded_user).to.have.keys('name', 'username', 'createdAt', 'id', 'profilePictureUrl', 'favorites', 'recentlyPlayed', 'stats');
      });
    });
  });

  describe('favorites', function() {
    it('should add a favorite', function() {
      var user = new User(user1);
      return user.addFavorite('myfave').spread(function(_user) {
        _user.favorites.should.have.length(1);
        _user.favorites[0].flow.should.eql('myfave');
        return user.addFavorite('myfave2');
      }).spread(function(_user) {
        _user.favorites.should.have.length(2);
        _user.favorites[1].flow.should.eql('myfave2');
      });
    });

    it('should not add duplicate favorites', function() {
      var user = new User(user1);
      return user.addFavorite('myfave').spread(function() {
        return user.addFavorite('myfave');
      }).spread(function(_user) {
        _user.favorites.should.have.length(1);
      });
    });

    it('should allow removing favorites', function() {
      var user = new User(user1);
      return user.addFavorite('myfave').spread(function() {
        return user.addFavorite('myfave2');
      }).spread(function() {
        return user.removeFavorite('myfave');
      }).spread(function(_user) {
        _user.favorites.should.have.length(1);
        _user.favorites[0].flow.should.eql('myfave2');
        return _user.removeFavorite('notappearing');
      }).spread(function(_user) {
        _user.favorites.should.have.length(1);
      });
    });
  });

  describe('stats', function() {
    var user;
    beforeEach(function() {
      user = new User(user1);
    });

    it('should record when a flow has been written', function() {
      return user.recordFlowWritten().spread(function(_user) {
        _user.stats.flowsWritten.should.eql(1);
        return user.recordFlowWritten();
      }).spread(function(_user) {
        _user.stats.flowsWritten.should.eql(2);
      });
    });

    it('should record a play event', function() {
      var flow = {
        moves: [
          { duration: 10},
          { duration: 20},
          { duration: 30}
        ],
        _id: 'flowid'
      };

      return user.recordPlay(flow).spread(function(_user) {
        _user.stats.flowsPlayed.should.eql(1);
        _user.stats.moves.should.eql(3);
        _user.stats.secondsPlayed.should.eql(60);
        _user.recentlyPlayed.should.have.length(1);
        return user.recordPlay(flow);
      }).spread(function(_user) {
        _user.stats.flowsPlayed.should.eql(2);
        _user.stats.moves.should.eql(6);
        _user.stats.secondsPlayed.should.eql(120);
        _user.recentlyPlayed.should.have.length(1);
      });
    });

    it('should only store 10 recently played flows', function() {
      var flows = [];
      for (var i = 0; i < 20; i++) {
        flows.push(user.recordPlay({
          moves: [],
          _id: 'flow' + i
        }));
      }

      return Promise.all(flows).then(function() {
        // Grab the user back from the db
        return User.findOne({_id: user._id}).exec();
      }).then(function(_user) {
        _user.recentlyPlayed.should.have.length(10);
        _user.recentlyPlayed[0].flow.should.eql('flow19');
      });
    });

    // Could instead use an array with arr.reduce(..., Promise.resolve()).then(...), but I couldn't test my initial invariant
    it('should move a recently played flow to the front', function() {
      var currentTime = Date.now();
      sandbox.stub(Date, 'now', function() {
        currentTime += 100;
        return currentTime;
      });

      var flow1 = { _id: 'flow1', moves: [] };
      var flow2 = { _id: 'flow2', moves: [] };

      return user.recordPlay(flow1).then(function() {
        return user.recordPlay(flow2);
      }).spread(function(_user) {
        _user.recentlyPlayed.should.have.length(2);
        _user.recentlyPlayed[0].flow.should.eql('flow2');
        return user.recordPlay(flow1);
      }).spread(function(_user) {
        _user.recentlyPlayed.should.have.length(2);
        _user.recentlyPlayed[0].flow.should.eql('flow1');
      });
    });
  });

  // source: https://github.com/linnovate/meansite
  describe('Test Email Validations', function() {
    it('Shouldnt allow invalid emails #1', function(done) {
      var _user = new User(user1);
      _user.email = 'Abc.example.com';
      _user.save(function(err) {
        expect(err).to.exist;
        done();
      });
    });

    it('Shouldnt allow invalid emails #2', function(done) {
      var _user = new User(user1);
      _user.email = 'A@b@c@example.com';
      _user.save(function(err) {
        expect(err).to.exist;
        done();
      });
    });

    it('Shouldnt allow invalid emails #3', function(done) {
      var _user = new User(user1);
      _user.email = 'a"b(c)d,e:f;g<h>i[j\\k]l@example.com';
      _user.save(function(err) {
        expect(err).to.exist;
        done();
      });
    });

    it('Shouldnt allow invalid emails #4', function(done) {
      var _user = new User(user1);
      _user.email = 'just"not"right@example.com';
      _user.save(function(err) {
        expect(err).to.exist;
        done();
      });
    });

    it('Shouldnt allow invalid emails #5', function(done) {
      var _user = new User(user1);
      _user.email = 'this is"not\\allowed@example.com';
      _user.save(function(err) {
        expect(err).to.exist;
        done();
      });
    });

    it('Shouldnt allow invalid emails #6', function(done) {
      var _user = new User(user1);
      _user.email = 'this\\ still\\"not\\allowed@example.com';
      _user.save(function(err) {
        expect(err).to.exist;
        done();
      });
    });

    it('Shouldnt allow invalid emails #7', function(done) {
      var _user = new User(user1);
      _user.email = 'john..doe@example.com';
      _user.save(function(err) {
        expect(err).to.exist;
        done();
      });
    });

    it('Shouldnt allow invalid emails #8', function(done) {
      var _user = new User(user1);
      _user.email = 'john.doe@example..com';
      _user.save(function(err) {
        expect(err).to.exist;
        done();
      });
    });

    it('Should save with valid email #1', function(done) {
      var _user = new User(user1);
      _user.email = 'john.doe@example.com';
      _user.save(function(err) {
        expect(err).to.not.exist;
        done();
      });
    });

    it('Should save with valid email #2', function(done) {
      var _user = new User(user1);
      _user.email = 'disposable.style.email.with+symbol@example.com';
      _user.save(function(err) {
        expect(err).to.not.exist;
        done();
      });
    });

    it('Should save with valid email #3', function(done) {
      var _user = new User(user1);
      _user.email = 'other.email-with-dash@example.com';
      _user.save(function(err) {
        expect(err).to.not.exist;
        done();
      });
    });
  });
});