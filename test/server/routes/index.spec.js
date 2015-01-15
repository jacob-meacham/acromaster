'use strict';

var request = require('supertest');
var app = require('../../../server');

describe('index', function() {
  describe('GET /version', function() {
    it('Should return a version string', function(done) {
      request(app)
        .get('/version')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(/\b[0-9a-f]{5,40}\b|Development version/, done);
    });
  });

  describe('GET /', function() {
    it('Should return an HTML page', function(done) {
      request(app)
        .get('/')
        .expect('Content-Type', /text\/html/)
        .expect(200, done);
    });
  });
});