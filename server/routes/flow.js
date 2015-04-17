'use strict';

var async = require('async');
var Flow = require('../models/flow.js');
var Move = require('../models/move.js');

var loadById = function(req, res, next, id) {
  Flow.load(id, function(err, flow) {
    if (err) {
      return next(err);
    }
    
    if (!flow) {
      return next(new Error('Failed to load flow with id ' + id));
    }

    req.flow = flow;
    next();
  });
};

var getFlow = function(req, res) {
  res.jsonp(req.flow);
};

var list = function(req, res, next) {
  var page = (req.query.page > 0 ? req.query.page : 1) - 1;
  var perPage = 100;
  var options = {
    page: page,
    perPage: perPage
  };

  Flow.list(options, function(err, flows) {
    if (err) {
      return next(err);
    }
    
    Flow.count().exec(function(err, count) {
      if (err) {
        return next(err);
      }

      res.jsonp({
        flows: flows,
        page: page+1,
        pages: Math.ceil(count/perPage)
      });
    });
  });
};

var create = function(req, res, next) {
  var flow = new Flow(req.body);
  if (flow.author) {
    if (!req.user || req.user._id !== flow.author._id) {
      res.status(401).send({error: new Error('This flow doesn\'belong to you')});
      return;
    }
  }
  
  if (req.user) {
    flow.author = req.user;
  }

  flow.save(function(err) {
    if (err) {
      return next(err);
    }

    res.jsonp(flow);
  });
};

var update = function(req, res) {
  var flow = req.flow;
  if (flow.author) {
    if (!req.user || req.user._id !== flow.author._id) {
      res.status(401).send({error: new Error('This flow doesn\'belong to you')});
      return;
    }
  }

  // Only moves can be updated in a flow.
  flow.moves = req.body.moves;
  flow.save(function() {
    res.jsonp(flow);
  });
};

var requireUser = function(req, res, next) {
  if (!req.user) {
    return res.status(401).send({error: new Error('No user')});
  }
  
  next();
};

var like = function(req, res, next) {
  var flow = req.flow;
  flow.like(req.user._id, function(err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(200);
  });
};

var removeLike = function(req, res, next) {
  var flow = req.flow;
  flow.cancelLike(req.user._id, function(err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(200);
  });
};

var hasLiked = function(req, res, next) {
  Flow.findLikes(req.user._id, {_id:req.flow._id}, function(err, likes) {
    if (err) {
      return next(err);
    }

    res.jsonp(!!likes.length);
  });
};

var recordPlayed = function(req, res, next) {
  req.flow.recordPlayed(req.user._id, function(err) {
    if (err) {
      return next(err);
    }

    return req.flow.plays;
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
var generate = function(req, res, routeNext) {
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
      return routeNext(err);
    }
    
    res.jsonp(result);
  });
};

module.exports = function(app) {
  app.get('/api/flow/generate', generate);
  app.get('/api/flow', list);
  app.get('/api/flow/:flowId', getFlow);
  app.post('/api/flow', create);
  app.put('/api/flow/:flowId', update);
  app.post('/api/flow/:flowId/likes', requireUser, like);
  app.delete('/api/flow/:flowId/likes', requireUser, removeLike);
  app.get('/api/flow/:flowId/likes', requireUser, hasLiked);
  app.post('/api/flow/:flowId/plays', requireUser, recordPlayed);

  app.param('flowId', loadById);
};