require('../models/movelist.js');
require('../models/move.js');
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

  var all_moves = [];
  Move.find({}, function(err, moves) {
    all_moves = moves;
  });

  parse = function(num) {
    var parsed = parseFloat(num);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Construct a new list using the passed parameters
  var move_list = [];
  var time_so_far = 0;
  var total_time = parse(req.query.totalTime);
  var time_per_move = parse(req.query.timePerMove);
  var time_variance = parse(req.query.timeVariance);
  while (true) {
    var move_time = time_per_move + Math.random() * time_variance;
    time_so_far += move_time;

    var move = {'time': move_time, 'move': all_moves[Math.floor(Math.random() * all_moves.length)]};
    move_list.push(move);

    if (time_so_far > total_time) {
      break;
    }
  }

  res.jsonp(move_list);
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
  //app.get('/moves/:moveListId', showList);
  app.get('/moves/newList', newList);
  //app.param('moveListId', getById);
};