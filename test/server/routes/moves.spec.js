'use strict';

var request = require('supertest');
var app = require('../../../server');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var async = require('async');
var Move = require('../../../server/models/move');

mockgoose(mongoose);

require('sinon');
require('mocha-sinon');
var chai = require('chai');
var expect = chai.expect;
chai.should();

var move1, move2;

describe('/api/flow', function() {
  before(function(done) {
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

    async.waterfall([
      function(cb) {
        move1.save(cb);
      },
      function(res, cb) {
        move2.save(cb);
      }], function(err) {
        expect(err).to.not.exist;
        done();
      });
  });

  after(function() {
    mockgoose.reset();
  });

  describe('GET /api/moves', function() {
    it('should return all moves with an empty query', function(done) {
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

    it('should return an error if there is an error connecting to the backing store', function(done) { 
      // TODO: Stub
      done();
    });
  });
});