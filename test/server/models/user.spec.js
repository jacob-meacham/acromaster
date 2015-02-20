'use strict';

var mongoose = require('mongoose');
var chai = require('chai');
require('../../../server/models/user.js');

chai.should();
var expect = chai.expect;

var User = mongoose.model('User');

var user1, user2;

describe('User Model', function() {
  before(function(done) {
    user1 = {
      name: 'Full name',
      email: 'test.foo@test.com',
      username: 'foo',
      provider: 'twitter'
    };

    user2 = {
      name: 'Full name',
      email: 'test.bar@test.com',
      username: 'bar',
      provider: 'google'
    };

    if (mongoose.connection.db) { return done(); }
    mongoose.connect('mongodb://localhost/am-test', done);
  });

  beforeEach(function(done) {
    User.remove({}, function() {
      done();
    });
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

        _user.name = 'Full name2';
        _user.save(function(err) {
          expect(err).to.not.exist();
          _user.name.should.equal('Full name2');
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

      return _user.save(function(err) {
        expect(err).to.exist();
        done();
      });
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