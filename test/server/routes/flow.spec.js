'use strict';

var request = require('supertest');
var app = require('../../../server');
var express = require('express');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var async = require('async');
require('../../../server/models/flow.js');
require('../../../server/models/move.js');

mockgoose(mongoose);

var chai = require('chai');
chai.should();

var expect = chai.expect;

require('sinon');
require('mocha-sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var Flow = mongoose.model('Flow');
var Move = mongoose.model('Move');
var User = mongoose.model('User');

var author1, author2;
var flow1, flow2, flow3;
var move1, move2;

// TODO: this should be mocked
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

    var _user = {
      name: 'Zulu',
      email: 'test.foo@test.com'
    };
    author1 = new User(_user);

    _user = {
        name: 'Abigail',
        email: 'test.bar@test.com'
      };
    author2 = new User(_user);

    var setupFlows = function() {
      var _flow = {
        name: 'Flow',
        author: author1,
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
        author: author2,
        createdAt: '12/10/1990'
      };
      flow2 = new Flow(_flow);

      _flow = {
        name: 'Flow 3',
        createdAt: '12/10/1991'
      };
      flow3 = new Flow(_flow);
    };

    async.waterfall([
      function(cb) {
        move1.save(cb);
      },
      function(res, cb) {
        move2.save(cb);
      },
      function(res, cb) {
        author1.save(cb);
      },
      function(res, cb) {
        author2.save(cb);
      },
      function(res, cb) {
        setupFlows();
        cb(null, null);
      },
      function(res, cb) {
        flow1.save(cb);
      },
      function(res, cb) {
        flow2.save(cb);
      },
      function(res, cb) {
        flow3.save(cb);
      }
      ], function(err) {
        expect(err).to.not.exist();
        done();
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
        .send({name: 'My Flow'})
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          res.body.should.have.property('name');
          res.body.name.should.equal('My Flow');
          expect(res.body.author).to.be.undefined();
        })
        .end(done);
    });

    describe('authenticated', function() {
      var authedApp;
      beforeEach(function() {
        authedApp = express();
        authedApp.all('*', function(req, res, next) {
          req.user = author1;
          next();
        });
        authedApp.use(app);
      });
      it('should use the logged in user as the author', function(done) {
        request(authedApp)
          .post('/api/flow')
          .send({name: 'Yet Another Flow'})
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function(res) {
            res.body.should.have.property('name');
            res.body.name.should.equal('Yet Another Flow');
            res.body.author.should.equal(author1._id);
          })
          .end(done);
      });
    });
  });

  describe('GET /api/flow/:flowId', function() {
    it('should return an error with an invalid id', function(done) {
      request(app)
        .get('/api/flow/0')
        .expect(500, done);
    });

    it('should return an error when the flow is not found', function(done) {
      request(app)
        .get('/api/flow/54b756f3ccc62d70143fd7ea')
        .expect(500)
        .expect(function(res) {
          res.body.error.should.match(/Failed to load flow/);
        })
        .end(done);
    });

    it('should return the correct flow when asked', function(done) {
      request(app)
        .get('/api/flow/' + flow1._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          var _flow = res.body;
          _flow.name.should.equal(flow1.name);
          _flow.author.name.should.equal(author1.name);
        })
        .end(done);
    });

    it('should only return the author name and id', function(done) {
      request(app)
        .get('/api/flow/' + flow1._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          var _flow = res.body;
          _flow.name.should.equal(flow1.name);
          _flow.author.name.should.equal(author1.name);
          expect(_flow.author._id).to.exist();
          expect(_flow.author.email).to.not.exist();
        })
        .end(done);
    });
  });
  
  describe('PUT /api/flow/:flowId', function() {
    it('should return an error with an invalid id', function(done) {
      request(app)
        .put('/api/flow/0')
        .expect(500, done);
    });

    it('should return an error if there is no session, and the flow has an author', function(done) {
      request(app)
        .put('/api/flow/' + flow1._id)
        .send({})
        .expect(401)
        .end(done);
    });

    it('should update without errors with no flow author', function(done) {
      request(app)
        .put('/api/flow/' + flow3._id)
        .send({moves: [{ 'duration': 10, 'move': move1._id }, { 'duration': 20, 'move': move2._id }]})
        .expect(200)
        .expect(function(res) {
          var _flow = new Flow(res.body);
          _flow.moves.length.should.equal(2);
        })
        .end(done);
    });

    describe('authenticated', function() {
      var authedApp;
      beforeEach(function() {
        authedApp = express();
        authedApp.all('*', function(req, res, next) {
          req.user = author1;
          next();
        });
        authedApp.use(app);
      });
      
      it('should return an error if the user is not the flow author', function(done) {
        request(authedApp)
          .put('/api/flow/' + flow2._id)
          .send({})
          .expect(401)
          .end(done);
      });

      it('should be a no op with an empty body', function(done) {
        request(authedApp)
          .put('/api/flow/' + flow1._id)
          .send({})
          .expect(200)
          .expect(function(res) {
            var _flow = res.body;
            _flow.name.should.equal(flow1.name);
            _flow.author.name.should.eql(author1.name);
          })
          .end(done);
      });

      it('should update without errors', function(done) {
        request(authedApp)
          .put('/api/flow/' + flow1._id)
          .send({moves: [{ 'duration': 10, 'move': move1._id }, { 'duration': 20, 'move': move2._id }]})
          .expect(200)
          .expect(function(res) {
            var _flow = new Flow(res.body);
            _flow.moves.length.should.equal(2);
          })
          .end(done);
      });
    });
  });

  describe('GET /api/flow', function() {
    it('should list all flows', function(done) {
      request(app)
        .get('/api/flow')
        .set('Accept', 'application/json')
        .expect(200)
        .expect(function(res) {
          res.body.flows.should.have.length(5);
          res.body.flows[0].name.should.equal('Yet Another Flow');
          res.body.flows[1].name.should.equal('My Flow');
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
        callback('Stub error');
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
          res.body.error.should.equal('Stub error');
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

  describe('POST /api/flow/likes', function() {
    it('should return success when liking a flow that exists', function(done) {
      request(app)
      .post('/api/flow/' + flow1._id + '/likes')
      .expect(200)
      .end(done);  
    });

    it('should fail when the flow is not known', function(done) {
      request(app)
      .post('/api/flow/noFlowHere/likes')
      .expect(500)
      .end(done);
    });

    it('should fail if no user is logged in', function(done) {
      request(app)
      .post('/api/flow/' + flow1._id + '/likes')
      .expect(500)
      .end(done);
    });
  });
  
  describe('GET /api/flow/likes', function() {
    it('should return true if the user has liked the flow', function(done) {
      // TODO Stub
      done();
    });

    it('should return false if the user hasn not liked the flow', function(done) {
      // TODO Stub
      done();
    });

    it('should fail when the flow is not known', function(done) {
      request(app)
      .get('/api/flow/noFlowHere/likes')
      .expect(500)
      .end(done);
    });

    it('should fail if no user is logged in', function(done) {
      request(app)
      .get('/api/flow/' + flow1._id + '/likes')
      .expect(500)
      .end(done);
    });
  });
});