'use strict';

var mongoose = require('mongoose');
var chai = require('chai');
require('../../../server/models/move.js');

chai.should();
var expect = chai.expect;

var globalMove;
var Move = mongoose.model('Move');
describe('Moves', function() {
  before(function (done) {
    globalMove = {
      name: 'New Move',
      difficulty: 5,
      audioUri: 'foo',
      aliases: ['a', 'b'],
      tags: 'tag1,tag2'
    };

    if (mongoose.connection.db) { return done(); }
    mongoose.connect('mongodb://localhost/am-test', done);
  });

  beforeEach(function(done) {
    Move.remove({}, function() {
      done();
    });
  });

  describe('save()', function() {
    it('should save without error', function(done) {
      var _move = new Move(globalMove);
      _move.save(function(err) {
        expect(err).to.not.exist();
        _move.remove();
        done();
      });
    });

    it('should not save with a blank name', function(done) {
      var move = new Move();
      move.save(function(err) {
        err.should.have.property('name', 'ValidationError');
        done();
      });
    });
  });

  describe('tags', function() {
    it('should set/get tags as a string', function(done) {
      var _move = new Move(globalMove);
      _move.tags.should.equal('tag1,tag2');
      _move.tags = 'tag1,tag2,tag3';
      _move.tags.should.equal('tag1,tag2,tag3');
      done();
    });
  });
});