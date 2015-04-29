'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
var mockgoose = require('mockgoose');
var chai = require('chai');
require('../../../server/models/flow.js');
require('../../../server/models/move.js');
require('../../../server/models/user.js');

chai.should();
var expect = chai.expect;

mockgoose(mongoose);

var flow1, flow2;
var move1, move2;
var user;
var Flow = mongoose.model('Flow');
var Move = mongoose.model('Move');
var User = mongoose.model('User');

var saveFlow = function(flow) {
  return flow.saveAsync().catch(function(err) {
    expect(err).to.not.exist;
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

    new Move(move1).saveAsync().then(function() {
      new Move(move2).saveAsync();
    }).then(function() {
      user.saveAsync();
    }).then(done, done);
  });
  
  describe('save()', function() {
    it('should save without error', function(done) {
      var _flow = new Flow(flow1);
      _flow.save(function(err) {
        expect(err).to.not.exist;
        done();
      });
    });

    it('should save a flow without an author without error', function(done) {
      var _flow = new Flow(flow2);
      _flow.save(function(err) {
        expect(err).to.not.exist;
        done();
      });
    });

    it('should be able to update flow without error', function(done) {
      var _flow = new Flow(flow1);
      _flow.saveAsync().then(function() {
        _flow.name = 'NewFlow';
        _flow.saveAsync();
      }).then(function() {
        _flow.name.should.equal('NewFlow');
      }).then(done, done);
    });

    it('should be able to save two flows with the same name', function(done) {
      var _flow1 = new Flow(flow1);
      _flow1.saveAsync().then(function() {
        var _flow2 = new Flow(flow1);
        _flow2.saveAsync();
      }).then(done, done);
    });
  });

  describe('load()', function() {
    it('should load with all moves intact', function(done) {
      Move.list({}).then(function(moves) {
        var _flow = new Flow(flow1);
        var move = { 'duration': 10, 'move': moves[0] };
        _flow.moves.push(move);

        move = {'duration': 20, 'move': moves[1] };
        _flow.moves.push(move);

        return _flow.populateAsync('moves.move');
      }).then(function(_flow) {
        _flow.moves.should.have.length(2);
        _flow.moves[1].move.name.should.equal('New Move 2');
      }).then(done, done);
    });

    it('should load by id', function(done) {
      var _flow = new Flow(flow1);
      _flow.saveAsync().then(function() {
        return Flow.load(_flow._id);
      }).then(function(loaded_flow) {
        loaded_flow.name.should.equal(_flow.name);
      }).then(done, done);
    });
  });

  describe('list()', function() {
    it('should start with an empty list', function() {
      Flow.find({}).exec().then(function(flows) {
        flows.should.have.length(0);
      });
    });

    it('should list multiple flows', function(done) {
      saveFlow(new Flow(flow1)).then(function() {
        return saveFlow(new Flow(flow2));
      }).then(function() {
        return Flow.list({});
      }).then(function(flows) {
        flows.should.have.length(2);
        flows[0].name.should.equal('Yet Another Flow');
      }).then(done, done);
    });

    it('should sort by the passed in option', function(done) {
      saveFlow(new Flow(flow1)).then(function() {
        return saveFlow(new Flow(flow2));
      }).then(function() {
        var userSchema = {
          name: 'Charlie',
          email: 'charlie_is_gr8@awesome.com'
        };

        var user = new User(userSchema);
        return user.saveAsync();
      }).then(function(author) {
        return saveFlow(new Flow({name: 'A Third Flow', author: author, createdAt: '12/10/1900'}));
      }).then(function() {
        return Flow.list({sortBy: 'name'});
      }).then(function(flows) {
        flows.should.have.length(3);

        flows[0].name.should.equal('Yet Another Flow');
        flows[1].name.should.equal('Flow 1');
        flows[2].name.should.equal('A Third Flow');
      }).then(done, done);
    });

    it('should list by pages', function(done) {
      saveFlow(new Flow(flow1)).then(function() {
        return saveFlow(new Flow(flow2));
      }).then(function() {
        return saveFlow(new Flow({name: 'Flow 3'}));
      }).then(function() {
        return Flow.list({max: 2, page: 0});
      }).then(function(flows) {
        flows.should.have.length(2);
        flows[0].name.should.equal('Flow 3');
        flows[1].name.should.equal('Yet Another Flow');
      }).then(function() {
        // TODO: Doesn't have to be serial
        return Flow.list({max: 2, page: 2});
      }).then(function(flows) {
        flows.should.have.length(0);
      }).then(done, done);
    });
  });
});
