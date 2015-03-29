'use strict';

var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var chai = require('chai');
var async = require('async');
require('../../../server/models/flow.js');
require('../../../server/models/move.js');
require('../../../server/models/user.js');
var async = require('async');

chai.should();
var expect = chai.expect;

mockgoose(mongoose);

var flow1, flow2;
var move1, move2;
var user;
var Flow = mongoose.model('Flow');
var Move = mongoose.model('Move');
var User = mongoose.model('User');

var saveFlow = function(flow, next) {
  flow.save(function(err) {
    expect(err).to.not.exist();
    next(null, null);
  });
};

describe('Flow Model', function() {
  before(function () {
    move1 = {
      _id: 'eWRhpRVa',
      name: 'New Move',
      difficulty: 5,
      audioUri: 'foo',
      aliases: ['a', 'b'],
      tags: 'tag1,tag2'
    };

    move2 = {
      _id: 'ADTplPdS',
      name: 'New Move 2',
      difficulty: 5,
      audioUri: 'foo',
      aliases: ['a', 'b'],
      tags: 'tag1,tag2'
    };

    var user1 = {
      _id: 'GgJuzcyx',
      name: 'Abigail',
      email: 'test.foo@test.com'
    };

    user = new User(user1);

    flow1 = {
      _id: 'dBvJIhSH',
      name: 'Flow 1',
      author: user,
      official: false,
      ratings: [5,10,5,10,5],
      createdAt: '12/10/1990'
    };

    flow2 = {
      _id: 'eWEKaVNO',
      name: 'Yet Another Flow',
      official: false,
      createdAt: '12/10/2010'
    };
  });

  beforeEach(function(done) {
    mockgoose.reset();

    async.parallel([
      function(cb) {
        new Move(move1).save(cb);
      },
      function(cb) {
        new Move(move2).save(cb);
      },
      function(cb) {
        user.save(cb);
      }
    ], function(err) {
      expect(err).to.not.exist();
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

    it('should save a flow without an author without error', function(done) {
      var _flow = new Flow(flow2);
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
      _flow1.save(function(err) {
        expect(err).to.not.exist();

        var _flow2 = new Flow(flow1);
        _flow2.save(function(err) {
          expect(err).to.not.exist();
          done();
        });
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

        async.parallel([
          function(cb) {
            _flow.save(cb);
          },
          function(cb) {
            _flow.populate('moves.move', function(err) {
              expect(err).to.not.exist();
              _flow.moves.should.have.length(2);
              _flow.moves[1].move.name.should.equal('New Move 2');
              cb();
            });
          }], done);
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
            flows[0].name.should.equal('Yet Another Flow');

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
          var userSchema = {
            name: 'Charlie',
            email: 'charlie_is_gr8@awesome.com'
          };

          var user = new User(userSchema);
          user.save(function(err, savedUser) {
            expect(err).to.not.exist();
            next(null, savedUser);
          });
        },

        function(author, next) {
          saveFlow(new Flow({name: 'A Third Flow', author: author, createdAt: '12/10/1900'}), next);
        },

        function() {
          Flow.list({sortBy: 'name'}, function(err, flows) {
            expect(err).to.not.exist();
            flows.should.have.length(3);

            flows[0].name.should.equal('Yet Another Flow');
            flows[1].name.should.equal('Flow 1');
            flows[2].name.should.equal('A Third Flow');
            
            
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
          saveFlow(new Flow({name: 'Flow 3'}), next);
        },
        
        function(err, next) {
          expect(err).to.not.exist();
          Flow.list({perPage: 2, page: 0}, function(err2, flows) {
            expect(err2).to.not.exist();
            flows.should.have.length(2);
            flows[0].name.should.equal('Flow 3');
            flows[1].name.should.equal('Yet Another Flow');
            next(null, null);
          });
        },

        function(err, next) {
          expect(err).to.not.exist();
          Flow.list({perPage: 2, page: 1}, function(err2, flows) {
            expect(err2).to.not.exist();
            flows.should.have.length(1);
            flows[0].name.should.equal('Flow 1');
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
});