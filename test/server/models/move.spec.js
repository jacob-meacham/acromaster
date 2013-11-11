var mongoose = require('mongoose');
var should = require('should');
var model = require('../../../server/models/move.js');
var Move = mongoose.model('Move');

// TODO: Remove
mongoose.connect('mongodb://localhost/test_db');
describe('Moves', function() {
  describe('save()', function() {
    it('should save without error', function(done) {
      var move = new Move();
      move.name = 'move name';
      move.save(done);
    });

    it('should not save with a blank name', function(done) {
      var move = new Move();
      move.save(function(err) {
        err.should.have.property('name', 'ValidationError');
        done();
      });
    });
  });
});