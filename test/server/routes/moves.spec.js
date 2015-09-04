'use strict';

var request = require('supertest-as-promised');
var app = require('../../../server');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var Move = require('../../../server/models/move');

Promise.promisifyAll(mongoose);
mockgoose(mongoose);

var sinon = require('sinon');
require('mocha-sinon');
var chai = require('chai');
chai.should();

describe('/api/flow', function() {
  var move1, move2;
  var sandbox;

  before(function() {
    var _move = {
      name: 'New Move',
      difficulty: 5,
      audioUri: 'foo',
      aliases: ['a', 'b'],
      tags: 'tag1,tag2'
    };
    move1 = new Move(_move);

    _move = {
      name: 'New Move 2',
      difficulty: 5,
      audioUri: 'foo',
      aliases: ['a', 'b'],
      tags: 'tag1,tag2'
    };
    move2 = new Move(_move);

    return move1.saveAsync().then(function() {
      return move2.saveAsync();
    });
  });

  after(function() {
    mockgoose.reset();
  });

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('GET /api/moves', function() {
    it('should return all moves with an empty query', function() {
      return request(app)
        .get('/api/moves')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function(res) {
          res.body.should.have.length(2);
          res.body[0].name.should.equal('New Move');
        });
    });

    it('should return a particular move with a query', function() {
      return request(app)
        .get('/api/moves')
        .query({name: 'New Move'})
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function(res) {
          res.body.should.have.length(1);
          res.body[0].name.should.equal('New Move');
        });
    });

    it('should return nothing with an invalid query', function() {
      return request(app)
        .get('/api/moves')
        .query({foo: 'New Move'})
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function(res) {
          res.body.should.have.length(0);
        });
    });

    it('should allow an empty query', function() {
      return request(app)
        .get('/api/moves')
        .query({foo: 'New Move'})
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function(res) {
          res.body.should.have.length(0);
      });
    });

    it('should return an error if there is an error connecting to the backing store', function() {
      sandbox.stub(Move, 'find', function(query, cb) {
        cb('errorTown');
      });

      return request(app)
        .get('/api/moves')
        .query({foo: 'New Move'})
        .expect(500)
        .expect(function(res) {
          res.body.error.should.match(/errorTown/);
        });
    });
  });
});