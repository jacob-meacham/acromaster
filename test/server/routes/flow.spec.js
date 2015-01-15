'use strict';

var request = require('supertest');
var app = require('../../../server');
var mongoose = require('mongoose');
require('../../../server/models/flow.js');
require('../../../server/models/move.js');
require('chai').should();

var Flow = mongoose.model('Flow');
var Move = mongoose.model('Move');

var flow;

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
    };

    flow = new Flow(_flow);

    var move = { 'duration': 10, 'move': move1._id };
    flow.moves.push(move);

    move = {'duration': 20, 'move': move2._id };
    flow.moves.push(move);

    flow.save(function() {
      done();
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
        .get('/api/flow/' + flow._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          var _flow = new Flow(res.body);
          _flow.name.should.equal(flow.name);
          _flow.author.should.equal(flow.author);
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
  });
});