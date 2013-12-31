var mongoose = require('mongoose');
var chai = require('chai');
var model = require('../../../server/models/move.js');

chai.should();

// TODO: Remove
var connection = mongoose.createConnection('mongodb://localhost/test_db');
var Move = connection.model('Move');
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