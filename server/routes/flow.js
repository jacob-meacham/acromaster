'use strict';

require('../models/flow.js');
require('../models/move.js');
var async = require('async');
var mongoose = require('mongoose');
var Flow = mongoose.model('Flow');
var Move = mongoose.model('Move');

var show = function(req, res) {
  res.jsonp(req.flow);
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
      Move.find(function(err, moves) {
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
      var flow = {};
      var flowEntries = [];
      var timeSoFar = 0;
      var totalTime = parse(req.query.totalTime);
      var timePerMove = parse(req.query.timePerMove);
      var timeVariance = parse(req.query.timeVariance);
      var numIterations = 0;
      while (numIterations < 100) {
        var moveTime = timePerMove + Math.random() * timeVariance;
        timeSoFar += moveTime;

        var flowEntry = {'time': moveTime, 'move': all_moves[Math.floor(Math.random() * all_moves.length)]};
        flowEntries.push(flowEntry);

        if (timeSoFar > totalTime) {
          break;
        }
        numIterations++;
      }

      flow.flowEntries = flowEntries;
      next(null, flow);
    }
  ],
  function(err, result) {
    if (err) {
      res.status(500).send({error: 'An error occured: ' + err});
    } else {
      console.log(result);
      res.jsonp(result);
    }
  });
};

var getById = function(req, res, next, id) {
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

module.exports = function(app) {
  app.get('/api/flow/generate', generate);
  app.get('/api/flow/:flowId', show);
  app.param('flowId', getById);
};