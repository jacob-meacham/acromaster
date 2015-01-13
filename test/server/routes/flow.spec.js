'use strict';

var request = require('supertest');
var app = require('../../../server');
require('chai').should();

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