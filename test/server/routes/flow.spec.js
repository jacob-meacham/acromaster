'use strict';

var request = require('supertest-as-promised');
var app = require('../../../server');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var async = require('async');
var Flow = require('../../../server/models/flow');
var Move = require('../../../server/models/move');
var User = require('../../../server/models/user');

mockgoose(mongoose);

var sinon = require('sinon');
require('sinon-as-promised');
require('mocha-sinon');
var chai = require('chai');
var expect = chai.expect;
chai.should();
chai.use(require('sinon-chai'));

describe('/api/flow', function() {
  var authedApp;
  var author1, author2;
  var flow1, flow2, flow3;
  var move1, move2;

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
    authedApp = require('./utils/authedApp')(app).withUser(author1);

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
        expect(err).to.not.exist;
        done();
      });
  });

  after(function() {
    mockgoose.reset();
  });

  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('POST /api/flow', function() {
    it('should not create with an empty body', function() {
      return request(app)
        .post('/api/flow')
        .send({})
        .expect(500)
        .expect('Content-Type', /json/)
        .expect(/ValidationError/);
    });

    it('should create with a name', function() {
      return request(app)
        .post('/api/flow')
        .send({name: 'My Flow'})
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          res.body.should.have.property('name');
          res.body.name.should.equal('My Flow');
          expect(res.body.author).to.be.undefined;
        });
    });

    it('should use the logged in user as the author', function() {
      return request(authedApp)
        .post('/api/flow')
        .send({name: 'Yet Another Flow'})
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          res.body.should.have.property('name');
          res.body.name.should.equal('Yet Another Flow');
          res.body.author.should.equal(author1._id);
        });
    });

    it('should not allow overwriting a flow with an author', function() {
      return request(authedApp)
        .post('/api/flow')
        .send({name: 'A Flow!', author: author2})
        .expect(401);
    });
  });

  describe('GET /api/flow/:flowId', function() {
    it('should return an error with an invalid id', function() {
      return request(app)
        .get('/api/flow/0')
        .expect(500);
    });

    it('should return an error when the flow is not found', function() {
      return request(app)
        .get('/api/flow/54b756f3ccc62d70143fd7ea')
        .expect(500)
        .expect(function(res) {
          res.body.error.should.match(/Failed to load flow/);
        });
    });

    it('should return the correct flow when asked', function() {
      return request(app)
        .get('/api/flow/' + flow1._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          var _flow = res.body;
          _flow.name.should.equal(flow1.name);
          _flow.author.name.should.equal(author1.name);
        });
    });

    it('should only return the author name and id', function() {
      return request(app)
        .get('/api/flow/' + flow1._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
          var _flow = res.body;
          _flow.name.should.equal(flow1.name);
          _flow.author.name.should.equal(author1.name);
          expect(_flow.author.id).to.exist;
          expect(_flow.author.email).to.not.exist;
        });
    });

    it('should return an error from the backing db', function() {
      sandbox.stub(Flow, 'load').rejects('bad id');
      return request(app)
        .get('/api/flow/' + flow1._id)
        .expect(500)
        .expect(function(res) {
          res.body.error.should.match(/bad id/);
        });
    });
  });
  
  describe('PUT /api/flow/:flowId', function() {
    it('should return an error with an invalid id', function() {
      return request(app)
        .put('/api/flow/0')
        .expect(500);
    });

    it('should return an error if there is no session, and the flow has an author', function() {
      return request(app)
        .put('/api/flow/' + flow1._id)
        .send({})
        .expect(401);
    });

    it('should not update with no flow author', function() {
      return request(app)
        .put('/api/flow/' + flow3._id)
        .send({moves: [{ 'duration': 10, 'move': move1._id }, { 'duration': 20, 'move': move2._id }]})
        .expect(401);
    });

    it('should return an error if the user is not the flow author', function() {
      return request(authedApp)
        .put('/api/flow/' + flow2._id)
        .send({})
        .expect(401);
    });

    it('should be a no op with an empty body', function() {
      return request(authedApp)
        .put('/api/flow/' + flow1._id)
        .send({})
        .expect(200)
        .expect(function(res) {
          var _flow = res.body;
          _flow.moves.length.should.eql(flow1.moves.length);
          _flow.name.should.eql(flow1.name);
          _flow.author.name.should.eql(author1.name);
        });
    });

    it('should update without errors', function() {
      var update = {
        moves: [{ 'duration': 10, 'move': move1._id }, { 'duration': 20, 'move': move2._id }],
        description: 'My new description',
        name: 'My new name',
        playCount: 1000
      };

      return request(authedApp)
        .put('/api/flow/' + flow1._id)
        .send(update)
        .expect(200)
        .expect(function(res) {
          var _flow = new Flow(res.body);
          _flow.moves.length.should.equal(2);
          _flow.description.should.eql('My new description');
          _flow.name.should.eql('My new name');
          _flow.playCount.should.eql(0);
        });
    });
  });

  describe('GET /api/flow', function() {
    it('should list all flows', function() {
      return request(app)
        .get('/api/flow')
        .expect(200)
        .expect(function(res) {
          res.body.flows.should.have.length(5);
          res.body.flows[0].name.should.equal('Yet Another Flow');
          res.body.flows[1].name.should.equal('My Flow');
        });
    });

    it('should list by pages', function() {
      return request(app)
        .get('/api/flow')
        .query({page: 1})
        .expect(200)
        .expect(function(res) {
          res.body.flows.should.have.length(5);
          res.body.page.should.equal(1);
          res.body.total.should.equal(5);
        }).then(function() {
          request(app)
            .get('/api/flow')
            .query({page: 2})
            .expect(200)
            .expect(function(res) {
              res.body.flows.should.have.length(0);
              res.body.page.should.equal(2);
              res.body.total.should.equal(5);
            });
        });
    });

    it('should return an error if list fails', function() {
      var stub = sandbox.stub(Flow, 'list');
      stub.rejects('Stub error');

      return request(app)
        .get('/api/flow')
        .expect(500)
        .expect(function(res) {
          stub.should.have.callCount(1);
          res.body.error.should.equal('Error: Stub error');
        });
    });

    it('should do full-text search', function() {
      var listSpy = sandbox.spy(Flow, 'list');

      return request(app)
        .get('/api/flow')
        .query({search_query: 'Flow'})
        .expect(200)
        .expect(function() {
          listSpy.should.have.callCount(1);
          var args = listSpy.getCall(0).args[0];
          args.should.have.property('searchQuery');
          args.searchQuery.should.eql({ $text: { $search: 'Flow' }});
        });
      });

    it('should return a random selection', function() {
      return request(app)
        .get('/api/flow')
        .query({random: true, max: 2})
        .expect(200)
        .expect(function(res) {
          res.body.flows.should.have.length(2);
        });
    });
  });

  describe('GET /api/flow/generate', function() {
    it('should return JSON', function() {
      return request(app)
        .get('/api/flow/generate')
        .set('Accept', 'application/json')
        .query({totalTime:'10', timePerMove:'10'})
        .expect('Content-Type', /json/)
        .expect(function(res) {
          res.body.should.have.property('name');
          res.body.should.have.property('moves');
        })
        .expect(200);
    });

    it('should fail without total time', function() {
      return request(app)
        .get('/api/flow/generate')
        .set('Accept', 'application/json')
        .query({timePerMove:'10'})
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({error: 'totalTime and timePerMove required'});
    });

    it('should fail without time per move', function() {
      return request(app)
        .get('/api/flow/generate')
        .set('Accept', 'application/json')
        .query({totalTime:'10'})
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({error: 'totalTime and timePerMove required'});
    });

    it('should fail if querying fails', function() {
      var stub = sandbox.stub(Move, 'list');
      stub.rejects('Stub error');

      return request(app)
        .get('/api/flow/generate')
        .set('Accept', 'application/json')
        .query({totalTime:'10', timePerMove:'10'})
        .expect(500)
        .expect(function(res) {
          stub.should.have.been.callCount(1);
          res.body.error.should.equal('Error: Stub error');
        });
    });
  });

  describe('POST /api/flow/likes', function() {
    it('should return success when liking a flow that exists', function() {
      return request(authedApp)
      .post('/api/flow/' + flow1._id + '/likes')
      .expect(200);
    });

    it('should not error if liking twice', function() {
      return request(authedApp)
      .post('/api/flow/' + flow1._id + '/likes')
      .expect(200)
      .then(function() {
        request(authedApp).post('/api/flow/' + flow1._id + '/likes')
        .expect(200);
      });
    });

    it('should fail when the flow is not known', function() {
      return request(authedApp)
      .post('/api/flow/noFlowHere/likes')
      .expect(500);
    });

    it('should fail if no user is logged in', function() {
      return request(app)
      .post('/api/flow/' + flow1._id + '/likes')
      .expect(401);
    });
  });
  
  describe('GET /api/flow/likes', function() {
    it('should return true if the user has liked the flow', function(done) {
      // TODO Stub
      done();
    });

    it('should return false if the user has not liked the flow', function(done) {
      // TODO Stub
      done();
    });

    it('should fail when the flow is not known', function() {
      return request(app)
      .get('/api/flow/noFlowHere/likes')
      .expect(500);
    });

    it('should fail if no user is logged in', function() {
      return request(app)
      .get('/api/flow/' + flow1._id + '/likes')
      .expect(401);
    });
  });

  describe('DELETE /api/flow/likes', function() {
    it('should remove a like', function() {
      // TODO: Get flow like and verify delete
      return request(authedApp)
        .post('/api/flow/' + flow1._id + '/likes')
        .expect(200)
        .then(function() {
          return request(authedApp)
          .delete('/api/flow/' + flow1._id + '/likes')
          .expect(200);
        });
    });

    it('should do nothing if the flow does not have a like from that user', function() {
      // TODO: Verify before and after state is the same (use another user with .withUser)
      return request(authedApp)
        .delete('/api/flow/' + flow1._id + '/likes')
        .expect(200);
    });

    it('should fail when the flow is not known', function() {
      return request(app)
      .get('/api/flow/noFlowHere/likes')
      .expect(500);
    });

    it('should fail if no user is logged in', function() {
      return request(app)
      .get('/api/flow/' + flow1._id + '/likes')
      .expect(401);
    });
  });

  describe('POST /api/flow/plays', function() {
    it('should add a play and a player', function() {
      // TODO: STUB
      return request(app)
      .get('/api/flow/' + flow1._id + '/play')
      .expect(200);
    });

    it('should not hold duplicate players', function() {
      // TODO: STUB
      return request(app)
      .get('/api/flow/' + flow1._id + '/play')
      .expect(200);
    });

    it('should not fail when no user is logged in', function() {
      // TODO: Stub
      return request(app)
      .get('/api/flow/' + flow1._id + '/play')
      .expect(200);
    });
  });
});