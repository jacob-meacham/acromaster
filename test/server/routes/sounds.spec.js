'use strict';

var request = require('supertest');
var app = require('../../../server');

var chai = require('chai');
chai.should();

describe('/api/sounds', function() {
  it('GET /api/sounds should return the sound root', function(done) {
    var env = process.env.NODE_ENV || 'development';
    var config = require('../../../server/config/config')[env];

    request(app)
        .get('/api/sounds')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          res.body.should.contain(config.s3.url);
        })
        .end(done);
  });
});