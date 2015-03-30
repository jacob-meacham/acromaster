'use strict';

var async = require('async');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var chai = require('chai');
require('../../../server/models/user.js');

mockgoose(mongoose);

chai.should();
var expect = chai.expect;

var User = mongoose.model('User');

var user1, user2;

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
    mockgoose.reset();
  });

  describe('save()', function() {
    it('should save without error', function(done) {
      var _user = new User(user1);
      _user.save(function(err) {
        expect(err).to.not.exist();
        _user.remove(done());
      });
    });

    it('should be able to update user without error', function(done) {
      var _user = new User(user1);
      _user.save(function(err) {
        expect(err).to.not.exist();

        _user.name = 'Bodhi Man';
        _user.save(function(err, result) {
          expect(err).to.not.exist();
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
          expect(err).to.exist();
          done();
        });
      });
    });

    it('should show an error when trying to save without name', function(done) {
      var _user = new User(user1);
      _user.name = '';

      _user.save(function(err) {
        expect(err).to.exist();
        done();
      });
    });

    it('should save a slugified version of the name', function(done) {
      var _user = new User(user2);
      _user.save(function(err, result) {
        expect(err).to.not.exist();
        result.username.should.equal('full-name-2');
        done();
      });
    });
  });

  describe('loadPublicProfile()', function() {
    it('should load a user by name', function(done) {
      var _user = new User(user1);
      async.waterfall([
        function(next) {
          _user.save(next);
        },

        function() {
          User.loadPublicProfile(_user.username, function(err, loaded_user) {
            expect(err).to.not.exist();
            loaded_user.name.should.equal(_user.name);
            done();
          });
        }
      ]);
    });

    it('should not load a nonexistent user', function(done) {
      User.loadPublicProfile('johnny-boy-11', function(err, user) {
        expect(err).to.not.exist();
        expect(user).to.not.exist();
        done();
      });
    });

    it('should load only public information', function(done) {
      var _user = new User(user1);
      async.waterfall([
        function(next) {
          _user.save(next);
        },

        function() {
          User.loadPublicProfile(_user.username, function(err, loaded_user) {
            expect(err).to.not.exist();
            expect(loaded_user).to.have.keys('name', 'username', 'createdAt', '_id', 'profilePictureUrl');
            done();
          });
        }
      ]);
    });
  });

  // source: https://github.com/linnovate/meansite
  describe('Test Email Validations', function() {
    it('Shouldnt allow invalid emails #1', function(done) {
      var _user = new User(user1);
      _user.email = 'Abc.example.com';
      _user.save(function(err) {
        expect(err).to.exist();
        done();
      });
    });

    it('Shouldnt allow invalid emails #2', function(done) {
      var _user = new User(user1);
      _user.email = 'A@b@c@example.com';
      _user.save(function(err) {
        expect(err).to.exist();
        done();
      });
    });

    it('Shouldnt allow invalid emails #3', function(done) {
      var _user = new User(user1);
      _user.email = 'a"b(c)d,e:f;g<h>i[j\\k]l@example.com';
      _user.save(function(err) {
        expect(err).to.exist();
        done();
      });
    });

    it('Shouldnt allow invalid emails #4', function(done) {
      var _user = new User(user1);
      _user.email = 'just"not"right@example.com';
      _user.save(function(err) {
        expect(err).to.exist();
        done();
      });
    });

    it('Shouldnt allow invalid emails #5', function(done) {
      var _user = new User(user1);
      _user.email = 'this is"not\\allowed@example.com';
      _user.save(function(err) {
        expect(err).to.exist();
        done();
      });
    });

    it('Shouldnt allow invalid emails #6', function(done) {
      var _user = new User(user1);
      _user.email = 'this\\ still\\"not\\allowed@example.com';
      _user.save(function(err) {
        expect(err).to.exist();
        done();
      });
    });

    it('Shouldnt allow invalid emails #7', function(done) {
      var _user = new User(user1);
      _user.email = 'john..doe@example.com';
      _user.save(function(err) {
        expect(err).to.exist();
        done();
      });
    });

    it('Shouldnt allow invalid emails #8', function(done) {
      var _user = new User(user1);
      _user.email = 'john.doe@example..com';
      _user.save(function(err) {
        expect(err).to.exist();
        done();
      });
    });

    it('Should save with valid email #1', function(done) {
      var _user = new User(user1);
      _user.email = 'john.doe@example.com';
      _user.save(function(err) {
        expect(err).to.not.exist();
        done();
      });
    });

    it('Should save with valid email #2', function(done) {
      var _user = new User(user1);
      _user.email = 'disposable.style.email.with+symbol@example.com';
      _user.save(function(err) {
        expect(err).to.not.exist();
        done();
      });
    });

    it('Should save with valid email #3', function(done) {
      var _user = new User(user1);
      _user.email = 'other.email-with-dash@example.com';
      _user.save(function(err) {
        expect(err).to.not.exist();
        done();
      });
    });
  });
});