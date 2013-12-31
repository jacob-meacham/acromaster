require('../models/movelist.js');
require('../models/move.js');
var async = require('async');
var mongoose = require('mongoose'),
  MoveList = mongoose.model('MoveList'),
  Move = mongoose.model('Move');

showList = function(req, res) {
  res.jsonp(req.moveList);
};

// {
//   'totalTime' : 3600,
//   'difficulty' : 3,
//   'timePerMove' : 15,
//   'timeVariance' : 10,
//   'transitionMoves' : true,
//   'style' : 'Training' // or whatever
// }
newList = function(req, res, next) {
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
      parse = function(num) {
        var parsed = parseFloat(num);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Construct a new list using the passed parameters
      var moveList = [];
      var timeSoFar = 0;
      var totalTime = parse(req.query.totalTime);
      var timePerMove = parse(req.query.timePerMove);
      var timeVariance = parse(req.query.timeVariance);
      var numIterations = 0;
      while (numIterations < 100) {
        var moveTime = timePerMove + Math.random() * timeVariance;
        timeSoFar += moveTime;

        var move = {'time': moveTime, 'move': all_moves[Math.floor(Math.random() * all_moves.length)]};
        moveList.push(move);

        if (timeSoFar > totalTime) {
          break;
        }
        numIterations++;
      }

      next(null, moveList);
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

getById = function(req, res, next, id) {
  MoveList.load(id, function(err, moveList) {
    if (err) {
      return next(err);
    }
    
    if (!moveList) {
      return next(new Error('Failed to load move list: ' + id));
    }
    req.moveList = moveList;
    next();
  });
};

module.exports = function(app) {
  app.get('/moves/newList', newList);
  app.get('/moves/:moveListId', showList);
  app.param('moveListId', getById);
};