var request = require('supertest');
var app = require('../../../app');
var chai = require('chai');
var expect = chai.expect;

describe('GET /moves/newList', function() {
  it('should return JSON', function(done) {
    request(app)
      .get('/moves/newList')
      .set('Accept', 'application/json')
      .query({totalTime:'10', timePerMove:'10'})
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('should fail without total time', function(done) {
    request(app)
      .get('/moves/newList')
      .set('Accept', 'application/json')
      .query({timePerMove:'10'})
      .expect('Content-Type', /json/)
      .expect(400)
      .expect({error: 'totalTime and timePerMove required'}, done);
  });

  it('should fail without time per move', function(done) {
    request(app)
      .get('/moves/newList')
      .set('Accept', 'application/json')
      .query({totalTime:'10'})
      .expect('Content-Type', /json/)
      .expect(400)
      .expect({error: 'totalTime and timePerMove required'}, done);
  });
});