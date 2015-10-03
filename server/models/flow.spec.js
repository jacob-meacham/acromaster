'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
var mockgoose = require('mockgoose');
mockgoose(mongoose);

var Flow = require('../../../server/models/flow');
var Move = require('../../../server/models/move');
var User = require('../../../server/models/user');

var chai = require('chai');
chai.should();
var expect = chai.expect;

var flow1, flow2;
var move1, move2;
var user;

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

  after(function() {
    mockgoose.reset();
  });

  beforeEach(function() {
    mockgoose.reset();

    return Promise.all([new Move(move1).saveAsync(), new Move(move2).saveAsync()]);
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

    it('should be able to update flow without error', function() {
      var _flow = new Flow(flow1);
      _flow.saveAsync().then(function() {
        _flow.name = 'NewFlow';
        _flow.saveAsync();
      }).then(function() {
        _flow.name.should.equal('NewFlow');
      });
    });

    it('should be able to save two flows with the same name', function() {
      var _flow1 = new Flow(flow1);
      return _flow1.saveAsync().then(function() {
        var _flow2 = new Flow(flow1);
        _flow2.saveAsync();
      });
    });
  });

  describe('load()', function() {
    it('should load with all moves intact', function() {
      return Move.list({}).then(function(moves) {
        var _flow = new Flow(flow1);
        var move = { 'duration': 10, 'move': moves[0] };
        _flow.moves.push(move);

        move = {'duration': 20, 'move': moves[1] };
        _flow.moves.push(move);

        return _flow.populateAsync('moves.move');
      }).then(function(_flow) {
        _flow.moves.should.have.length(2);
        _flow.moves[1].move.name.should.equal('New Move 2');
      });
    });

    it('should load by id', function() {
      var _flow = new Flow(flow1);
      return _flow.saveAsync().then(function() {
        return Flow.load(_flow._id);
      }).then(function(loaded_flow) {
        loaded_flow.name.should.equal(_flow.name);
      });
    });
  });

  describe('list()', function() {
    it('should start with an empty list', function() {
      Flow.find({}).exec().then(function(flows) {
        flows.should.have.length(0);
      });
    });

    it('should list multiple flows', function() {
      return Promise.all([saveFlow(new Flow(flow1)), saveFlow(new Flow(flow2))]).then(function() {
        return Flow.list({});
      }).then(function(flows) {
        flows.should.have.length(2);
        flows[0].name.should.equal('Yet Another Flow');
      });
    });

    it('should sort by the passed in option', function() {
      return saveFlow(new Flow(flow1)).then(function() {
        return saveFlow(new Flow(flow2));
      }).then(function() {
        var user = new User({name: 'Charlie', email: 'charlie_is_gr8@awesome.com'});
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
      });
    });

    it('should list by pages', function() {
      var flows = [saveFlow(new Flow(flow1)), saveFlow(new Flow(flow2)), saveFlow(new Flow({name: 'Flow 3'}))];

      return Promise.all(flows).then(function() {
        return Flow.list({max: 2, page: 0});
      }).then(function(flows) {
        flows.should.have.length(2);
        flows[0].name.should.equal('Flow 3');
        flows[1].name.should.equal('Yet Another Flow');
      }).then(function() {
        return Flow.list({max: 2, page: 2});
      }).then(function(flows) {
        return flows.should.have.length(0);
      });
    });
  });

  describe('listByUser()', function() {
    it('should list flows by the given user', function() {
      var flows = [saveFlow(new Flow(flow1)), saveFlow(new Flow(flow2)), saveFlow(new Flow({name: 'Flow 3', author: user}))];

      return Promise.all(flows).then(function() {
        return Flow.listByUser(user._id, {});
      }).then(function(flows) {
        flows.should.have.length(2);
        return Flow.listByUser(user._id, {max: 1, page: 0});
      }).then(function(flows) {
        flows.should.have.length(1);
        return Flow.listByUser(user._id, {max: 10, page: 1});
      }).then(function(flows) {
        flows.should.have.length(0);
      });
    });

    it('should return the count of flows by the user', function() {
      var flows = [saveFlow(new Flow(flow1)), saveFlow(new Flow(flow2)), saveFlow(new Flow({name: 'Flow 3', author: user}))];
      return Promise.all(flows).then(function() {
        return Flow.countByUser(user._id);
      }).then(function(count) {
        count.should.eql(2);
      });
    });
  });

  describe('recordPlayed()', function() {
    it('should record a play event', function() {
      return saveFlow(new Flow(flow1)).then(function() {
        return Flow.recordPlayed(flow1._id, user._id);
      }).then(function(flow) {
        flow.playCount.should.eql(1);
        flow.plays[0].should.eql(user._id);
      });
    });

    it('should not record duplicate players', function() {
      return saveFlow(new Flow(flow1)).then(function() {
        return Flow.recordPlayed(flow1._id, user._id);
      }).then(function(flow) {
        flow.playCount.should.eql(1);
        flow.plays[0].should.eql(user._id);
        return Flow.recordPlayed(flow1._id, user._id);
      }).then(function(flow) {
        flow.playCount.should.eql(2);
        flow.plays.should.have.length(1);
      });
    });
  });
});
