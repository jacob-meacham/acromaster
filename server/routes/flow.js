'use strict';

require('../models/flow.js');
require('../models/move.js');
var async = require('async');
var _ = require('underscore');
var mongoose = require('mongoose');
var Flow = mongoose.model('Flow');
var Move = mongoose.model('Move');

var loadById = function(req, res, next, id) {
  Flow.load(id, function(err, flow) {
    if (err) {
      return next(err);
    }
    
    if (!flow) {
      return next(new Error('Failed to load move list: ' + id));
    }

    req.flow = flow;
    next();
  });
};

var show = function(req, res) {
  res.jsonp(req.flow);
};

var list = function(req, res) {
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var perPage = 100;
  var options = {
    page: page,
    perPage: perPage
  };

  Flow.list(options, function(err, flows) {
    if (err) {
      res.status(500).send({error: err});
      return;
    }
    
    Flow.count().exec(function(err, count) {
      if (err) {
        res.status(500).send({error: err});
        return;
      }

      res.jsonp({
        flows: flows,
        page: page+1,
        pages: Math.ceil(count/perPage)
      });
    });
  });
};

var create = function(req, res) {
  var flow = new Flow(req.body);

  flow.save(function(err) {
    if (err) {
      res.status(500).send({error: err});
      return;
    }

    res.jsonp(flow);
  });
};

var update = function(req, res) {
  var flow = req.flow;
  flow = _.extend(flow, req.body);

  flow.save(function() {
    res.jsonp(flow);
  });
};

// {
//   'totalTime' : 3600,
//   'difficulty' : 3,
//   'timePerMove' : 15,
//   'timeVariance' : 10,
//   'transitionMoves' : true,
//   'style' : 'Training' // or whatever
// }
var generate = function(req, res) {
  if (!('totalTime' in req.query) || !('timePerMove' in req.query)) {
    res.status(400).send({error: 'totalTime and timePerMove required'});
    return;
  }

  async.waterfall([
    function(next) {
      Move.list({}, function(err, moves) {
        if (err) {
          next(err, null);
        } else {
          next(null, moves);
        }
      });
    },

    function(all_moves, next) {
      var parse = function(num) {
        var parsed = parseFloat(num);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Construct a new list using the passed parameters
      var flow = new Flow();
      flow.name = 'Quick Flow';

      var timeSoFar = 0;
      var totalTime = parse(req.query.totalTime);
      var timePerMove = parse(req.query.timePerMove);
      var timeVariance = parse(req.query.timeVariance);
      var numIterations = 0;
      while (numIterations < 100) {
        var moveDuration = timePerMove + Math.random() * timeVariance;
        timeSoFar += moveDuration;

        var move = { 'duration': moveDuration, 'move': all_moves[Math.floor(Math.random() * all_moves.length)] };
        flow.moves.push(move);

        if (timeSoFar > totalTime) {
          break;
        }
        numIterations++;
      }

      flow.populate('moves.move', function(err) {
        next(err, flow);
      });
    }
  ],
  function(err, result) {
    if (err) {
      res.status(500).send({error: 'An error occured: ' + err});
    } else {
      res.jsonp(result);
    }
  });
};

var getMoves = function(req, res) {
  Move.list({}, function(err, moves) {
    if (err) {
      res.status(500).send({error: err});
      return;
    }

    res.jsonp(moves);
  });
};

module.exports = function(app) {
  app.get('/api/flow/generate', generate);
  app.get('/api/flow', list);
  app.get('/api/flow/:flowId', show);
  app.post('/api/flow', create);
  app.put('/api/flow/:flowId', update);
  app.get('/api/moves', getMoves);

  app.param('flowId', loadById);
};