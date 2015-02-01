'use strict';

var mongoose = require('mongoose');
var chai = require('chai');
var async = require('async');
require('../../../server/models/flow.js');
require('../../../server/models/move.js');

chai.should();
var expect = chai.expect;

var flow1, flow2;
var move1, move2;
var Flow = mongoose.model('Flow');
var Move = mongoose.model('Move');

var saveFlow = function(flow, next) {
   flow.save(function(err) {
      expect(err).to.not.exist();
      next(null, null);
    });
};

describe('Flow Model', function() {
  before(function (done) {
    move1 = {
      name: 'New Move',
      difficulty: 5,
      audioUri: 'foo',
      aliases: ['a', 'b'],
      tags: 'tag1,tag2'
    };

    move2 = {
      name: 'New Move 2',
      difficulty: 5,
      audioUri: 'foo',
      aliases: ['a', 'b'],
      tags: 'tag1,tag2'
    };

    new Move(move1).save();
    new Move(move2).save();

    flow1 = {
      name: 'Flow',
      author: 'Zulu',
      official: false,
      ratings: [5,10,5,10,5],
      createdAt: '12/10/1990'
    };

    flow2 = {
      name: 'Flow 2',
      author: 'Abigail',
      official: false,
      createdAt: '12/10/2010'
    };

    if (mongoose.connection.db) { return done(); }
    mongoose.connect('mongodb://localhost/am-test', done);
  });

  after(function(done) {
    Move.remove({}, function() {
      done();
    });
  });

  beforeEach(function(done) {
    Flow.remove({}, function() {
      done();
    });
  });
  
  describe('save()', function() {
    it('should save without error', function(done) {
      var _flow = new Flow(flow1);
      _flow.save(function(err) {
        expect(err).to.not.exist();
        done();
      });
    });

    it('should be able to update flow without error', function(done) {
      var _flow = new Flow(flow1);
      _flow.save(function(err) {
        expect(err).to.not.exist();

        _flow.name = 'NewFlow';
        _flow.save(function(err) {
          expect(err).to.not.exist();
          _flow.name.should.equal('NewFlow');
          done();
        });
      });
    });

    it('should be able to save two flows with the same name', function(done) {
      var _flow1 = new Flow(flow1);
      _flow1.save();

      var _flow2 = new Flow(flow1);
      _flow2.save(function(err) {
        expect(err).to.not.exist();
        done();
      });
    });
  });

  describe('load()', function() {
    it('should load with all moves intact', function(done) {
      Move.list({}, function(err, moves) {
        expect(err).to.not.exist();
        var _flow = new Flow(flow1);

        var move = { 'duration': 10, 'move': moves[0] };
        _flow.moves.push(move);

        move = {'duration': 20, 'move': moves[1] };
        _flow.moves.push(move);

        _flow.save();

        _flow.populate('moves.move', function(err) {
          expect(err).to.not.exist();
          _flow.moves.should.have.length(2);
          _flow.moves[1].move.name.should.equal('New Move 2');
          done();
        });
      });
    });

    it('should load by id', function(done) {
      var _flow = new Flow(flow1);
      async.waterfall([
        function(next) {
          _flow.save(next);
        },

        function() {
          Flow.load(_flow._id, function(err, loaded_flow) {
            expect(err).to.not.exist();
            loaded_flow.name.should.equal(_flow.name);
            done();
          });
        }
      ]);
    });
  });

  describe('list()', function() {
    it('should start with an empty list', function(done) {
      Flow.find({}, function(err, flows) {
        flows.should.have.length(0);
        done();
      });
    });

    it('should list multiple flows', function(done) {
      async.waterfall([
        function(next) {
          saveFlow(new Flow(flow1), next);
        },

        function(result, next) {
          saveFlow(new Flow(flow2), next);
        },

        function() {
          Flow.list({}, function(err, flows) {
            expect(err).to.not.exist();
            flows.should.have.length(2);
            flows[0].name.should.equal('Flow 2');

            done();
          });
        }
      ]);
    });

    it('should sort by the passed in option', function(done) {
      async.waterfall([
        function(next) {
          saveFlow(new Flow(flow1), next);
        },

        function(result, next) {
          saveFlow(new Flow(flow2), next);
        },

        function(result, next) {
          saveFlow(new Flow({name: 'Flow 3', author: 'Charlie'}), next);
        },

        function() {
          Flow.list({sortBy: 'author'}, function(err, flows) {
            expect(err).to.not.exist();
            flows.should.have.length(3);
            flows[1].author.should.equal('Charlie');
            done();
          });
        }
      ]);
    });

    it('should list by pages', function(done) {
      async.waterfall([
        function(next) {
          saveFlow(new Flow(flow1), next);
        },

        function(result, next) {
          saveFlow(new Flow(flow2), next);
        },

        function(result, next) {
          saveFlow(new Flow({name: 'Flow 3', author: 'Charlie'}), next);
        },
        
        function(err, next) {
          expect(err).to.not.exist();
          Flow.list({perPage: 2, page: 0}, function(err2, flows) {
            expect(err2).to.not.exist();
            flows.should.have.length(2);
            flows[0].author.should.equal('Charlie');
            flows[1].author.should.equal('Abigail');
            next(null, null);
          });
        },

        function(err, next) {
          expect(err).to.not.exist();
          Flow.list({perPage: 2, page: 1}, function(err2, flows) {
            expect(err2).to.not.exist();
            flows.should.have.length(1);
            flows[0].author.should.equal('Zulu');
            next(null, null);
          });
        },

        function() {
          Flow.list({perPage: 2, page: 2}, function(err, flows) {
            expect(err).to.not.exist();
            flows.should.have.length(0);
            done();
          });
        }
      ]);
    });
  });

  describe('getRating', function()  {
    it('should return -1 if no ratings exist', function(done) {
      var _flow = new Flow(flow2);
      _flow.getRating().should.equal(-1);
      done();
    });

    it('should return mean of existing ratings', function(done) {
      var _flow = new Flow(flow1);
      _flow.getRating().should.equal(7);
      done();
    });
  });
});