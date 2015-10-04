'use strict';

var request = require('supertest-as-promised');
var app = require('../../../server');
var User = require('../../../server/models/user.js');



describe('index', function() {
  describe('GET /version', function() {
    it('Should return a version string', function() {
      return request(app)
        .get('/version')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(/\b[0-9a-f]{5,40}\b|Development version/);
    });
  });

  describe('GET /', function() {
    it('Should return an HTML page', function() {
      return request(app)
        .get('/')
        .expect('Content-Type', /text\/html/)
        .expect(200);
    });

    it('Should return an HTML page with a user', function() {
      var authedApp = require('./utils/authedApp')(app).withUser(new User({username: 'carol', name: 'carol'}));
      return request(authedApp)
        .get('/')
        .expect(200);
    });
  });
});