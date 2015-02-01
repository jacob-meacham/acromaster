'use strict';

var request = require('supertest');
var app = require('../../../server');
var mongoose = require('mongoose');
require('../../../server/models/flow.js');
require('../../../server/models/move.js');

var chai = require('chai');
chai.should();

require('sinon');
require('mocha-sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var Flow = mongoose.model('Flow');
var Move = mongoose.model('Move');

var flow1, flow2;

// TODO: this should be mocked
describe('/api/flow', function() {
  before(function(done) {
    var move1 = {
      name: 'New Move',
      difficulty: 5,
      audioUri: 'foo',
      aliases: ['a', 'b'],
      tags: 'tag1,tag2'
    };

    var move2 = {
      name: 'New Move 2',
      difficulty: 5,
      audioUri: 'foo',
      aliases: ['a', 'b'],
      tags: 'tag1,tag2'
    };

    new Move(move1).save();
    new Move(move2).save();

    var _flow = {
      name: 'Flow',
      author: 'Zulu',
      official: false,
      ratings: [5, 10, 5, 10, 5],
      createdAt: '12/10/2010'
    };

    flow1 = new Flow(_flow);
    var move = { 'duration': 10, 'move': move1._id };
    flow1.moves.push(move);

    move = {'duration': 20, 'move': move2._id };
    flow1.moves.push(move);

    _flow = {
      name: 'Flow 2',
      author: 'Abigail',
      createdAt: '12/10/1990'
    };
    flow2 = new Flow(_flow);

    mongoose.connect('mongodb://localhost/am-test', function() {
      flow1.save(function() {
        flow2.save(function() {
          done();
        });
      });
    });
  });

  after(function(done) {
    Flow.remove({}, function() {
      Move.remove({}, function() {
        done();
      });
    });
  });

  describe('POST /api/flow', function() {
    it('should not create with an empty body', function(done) {
      request(app)
        .post('/api/flow')
        .send({})
        .expect(500)
        .expect('Content-Type', /json/)
        .expect(/ValidationError/, done);
    });

    it('should create with a name', function(done) {
      request(app)
        .post('/api/flow')
        .send({name: 'My Flow', author: 'Bradley'})
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          res.body.should.have.property('name');
          res.body.name.should.equal('My Flow');
          res.body.author.should.equal('Bradley');
        })
        .end(done);
    });
  });

  describe('GET /api/flow/:flowId', function() {
    it('should return an error with an invalid id', function(done) {
      request(app)
        .get('/api/flow/0')
        .expect(500)
        .expect(/CastError/, done);
    });

    it('should return an error when the flow is not found', function(done) {
      request(app)
        .get('/api/flow/54b756f3ccc62d70143fd7ea')
        .expect(500)
        .expect(/Failed to load move list/, done);
    });

    it('should return the correct flow when asked', function(done) {
      request(app)
        .get('/api/flow/' + flow1._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          var _flow = new Flow(res.body);
          _flow.name.should.equal(flow1.name);
          _flow.author.should.equal(flow1.author);
        })
        .end(done);
    });
  });
  
  describe('PUT /api/flow/:flowId', function() {
    it('should return an error with an invalid id', function(done) {
      request(app)
        .put('/api/flow/0')
        .expect(500)
        .expect(/CastError/, done);
    });

    it('should be a no op with an empty body', function(done) {
      request(app)
        .put('/api/flow/' + flow1._id)
        .send({})
        .expect(200)
        .expect(function(res) {
          var _flow = new Flow(res.body);
          _flow.name.should.equal(flow1.name);
          _flow.author.should.equal(flow1.author);
        })
        .end(done);
    });

    it('should update without errors', function(done) {
      request(app)
        .put('/api/flow/' + flow1._id)
        .send({official: true})
        .expect(200)
        .expect(function(res) {
          var _flow = new Flow(res.body);
          _flow.official.should.equal(true);
        })
        .end(done);
    });
  });

  describe('GET /api/flow', function() {
    it('should list all flows', function(done) {
      request(app)
        .get('/api/flow')
        .set('Accept', 'application/json')
        .expect(200)
        .expect(function(res) {
          res.body.flows.should.have.length(3);
          res.body.flows[0].name.should.equal('My Flow');
          res.body.flows[1].name.should.equal('Flow');
        })
        .end(done);
    });

    it('should list by pages', function(done) {
      request(app)
        .get('/api/flow')
        .query({page: 1})
        .set('Accept', 'application/json')
        .expect(200)
        .expect(function(res) {
          res.body.flows.should.have.length(3);
          res.body.page.should.equal(1);
          res.body.pages.should.equal(1);
        });

      request(app)
        .get('/api/flow')
        .query({page: 2})
        .set('Accept', 'application/json')
        .expect(200)
        .expect(function(res) {
          res.body.flows.should.have.length(0);
          res.body.page.should.equal(2);
          res.body.pages.should.equal(1);
        })
        .end(done);
    });

    it('should return an error if list fails', function(done) {
      var stub = this.sinon.stub(Flow, 'list', function(options, callback) {
        callback('Stub error', null);
      });

      request(app)
        .get('/api/flow')
        .set('Accept', 'application/json')
        .expect(500)
        .expect(function(res) {
          stub.should.have.been.callCount(1);
          res.body.error.should.equal('Stub error');
        })
        .end(done);
    });
  });

  describe('GET /api/flow/generate', function() {
    it('should return JSON', function(done) {
      request(app)
        .get('/api/flow/generate')
        .set('Accept', 'application/json')
        .query({totalTime:'10', timePerMove:'10'})
        .expect('Content-Type', /json/)
        .expect(function(res) {
          res.body.should.have.property('name');
          res.body.should.have.property('moves');
        })
        .expect(200, done);
    });

    it('should fail without total time', function(done) {
      request(app)
        .get('/api/flow/generate')
        .set('Accept', 'application/json')
        .query({timePerMove:'10'})
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({error: 'totalTime and timePerMove required'}, done);
    });

    it('should fail without time per move', function(done) {
      request(app)
        .get('/api/flow/generate')
        .set('Accept', 'application/json')
        .query({totalTime:'10'})
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({error: 'totalTime and timePerMove required'}, done);
    });

    it('should fail if the Move find fails', function(done) {
      var stub = this.sinon.stub(Move, 'list', function(query, callback) {
        callback('Stub error', null);
      });

      request(app)
        .get('/api/flow/generate')
        .set('Accept', 'application/json')
        .query({totalTime:'10', timePerMove:'10'})
        .expect(500)
        .expect(function(res) {
          stub.should.have.been.callCount(1);
          res.body.error.should.equal('An error occurred: Stub error');
        })
        .end(done);
    });
  });

  describe('GET /api/moves', function() {
    it('should return the set of moves with an empty', function(done) {
      request(app)
        .get('/api/moves')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function(res) {
          res.body.should.have.length(2);
          res.body[0].name.should.equal('New Move');
        })
        .end(done);
    });

    it('should return a particular move with a query', function(done) {
      request(app)
        .get('/api/moves')
        .query({name: 'New Move'})
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function(res) {
          res.body.should.have.length(1);
          res.body[0].name.should.equal('New Move');
        })
        .end(done);
    });

    it('should return nothing with an invalid query', function(done) {
      request(app)
        .get('/api/moves')
        .query({foo: 'New Move'})
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function(res) {
          res.body.should.have.length(0);
        })
        .end(done);
    });
  });
});