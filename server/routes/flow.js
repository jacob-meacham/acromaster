'use strict';

var Flow = require('../models/flow.js');
var Move = require('../models/move.js');

var loadById = function(req, res, next, id) {
  Flow.load(id).then(function(flow) {
    if (!flow) {
      return next(new Error('Failed to load flow with id ' + id));
    }

    req.flow = flow;
    next();
  }).then(null, next);
};

var loadFlowFromBody = function(req, res, next) {
  req.flow = new Flow(req.body);
  next();
};

var requireAuthorMatch = function(req, res, next) {
  if (req.flow.author) {
    if (!req.isAuthenticated() || req.user._id !== req.flow.author._id) {
      return next({error: new Error('This flow doesn\'t belong to you'), status: 401});
    }
  }
  next();
};

var requireUser = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return next({error: new Error('No user'), status: 401});
  }
  
  next();
};

var requireUserOrAnonId = function(req, res, next) {
  if (!req.isAuthenticated()) {
    if (!req.query.anonId || req.query.anonId.indexOf('__anon_') !== 0) {
      return next({error: new Error('Need to be logged in or have a valid anon id'), status: 401});
    }

    req.userId = req.query.anonId;
  } else {
    req.userId = req.user.id;
  }

  next();
};

var getFlow = function(req, res) {
  res.jsonp(req.flow);
};

var _getMax = function(req) {
  var max = req.query.max;
  if (!max || max > 100) {
    max = 100;
  }

  return max;
};

var _listRandom = function(req, res, next) {
  var max = _getMax(req);
  Flow.findRandom().limit(max).exec().then(function(flows) {
    res.jsonp({
      flows: flows,
      total: max
    });
  }).then(null, next); // Pass errors directly to next
};

var _listInternal = function(req, res, next) {
  var page = (req.query.page > 0 ? req.query.page : 1) - 1;
  var max = _getMax(req);

  var options = {
    page: page,
    max: max,
  };

  if (req.query.search_query) {
    options.searchQuery = { $text: { $search : req.query.search_query } };
    options.score = { $meta: 'textScore' };
    options.sortBy = { score: options.score };
  }

  var flows = null;
  Flow.list(options).then(function(_flows) {
    flows = _flows;
    return Flow.count().exec();
  }).then(function(count) {
    res.jsonp({
      flows: flows,
      page: page+1,
      total: count // TODO: Fix total in the search query case.
    });
  }).then(null, next); // Pass errors directly to next
};

var list = function(req, res, next) {
  if (req.query.random) {
    _listRandom(req, res, next);
  } else {
    _listInternal(req, res, next);
  }
};

var create = function(req, res, next) {
  var flow = req.flow;
  if (req.user) {
    flow.author = req.user;
    flow.authorName = req.user.name;

    // We actually created this, so lets write it down
    req.user.recordFlowWritten(); // Async is totally fine - we can just throw errors on the floor.
  }

  flow.saveAsync().then(function() {
    res.jsonp(flow);
  }).catch(next);
};

var update = function(req, res, next) {
  var flow = req.flow;
  if (!flow.author) {
    return res.status(401).send({error: new Error('This flow doesn\'belong to you')});
  }

  // Only allow changes to moves, name, and description.
  if (req.body.moves) { flow.moves = req.body.moves; }
  if (req.body.name) { flow.name = req.body.name; }
  if (req.body.description) { flow.description = req.body.description; }

  flow.saveAsync().then(function() {
    res.jsonp(flow);
  }).catch(next);
};

var deleteFlow = function(req, res, next) {
  var flow = req.flow;
  flow.removeAsync().then(function() {
    res.status(200);
  }).catch(next);
};

var like = function(req, res, next) {
  var flow = req.flow;
  flow.like(req.userId, function(err) {
    if (err) {
      return next(err);
    }

    res.jsonp(flow);
  });
};

var removeLike = function(req, res, next) {
  var flow = req.flow;
  flow.cancelLike(req.userId, function(err) {
    if (err) {
      return next(err);
    }

    res.jsonp(flow);
  });
};

var hasLiked = function(req, res, next) {
  Flow.findLikes(req.userId, {_id:req.flow._id}, function(err, likes) {
    if (err) {
      return next(err);
    }

    res.jsonp({hasLiked: !!likes.length});
  });
};

var recordPlayed = function(req, res, next) {
  var userId = 0;
  if (req.user) {
    // If there is no user, just record with a dummy player.
    userId = req.user._id;
  }

  req.flow.recordPlayed(userId).then(function() {
    if (req.user) {
      return req.user.recordPlay(req.flow);
    }
  }).then(function() {
    res.jsonp({plays: req.flow.plays});
  }).then(null, next);
};

var generate = function(req, res, next) {
  if (!('totalTime' in req.query) || !('timePerMove' in req.query)) {
    res.status(400).send({error: 'totalTime and timePerMove required'});
    return;
  }

  var generateFlow = function(all_moves) {
    var parse = function(num) {
        var parsed = parseFloat(num);
        return isNaN(parsed) ? 0 : parsed;
      };

    // Construct a new list using the passed parameters
    var flow = new Flow();
    flow.name = 'Quick Flow';
    flow.workout = true;

    if (req.query.flowName) {
      flow.name = req.query.flowName;
    }

    if (req.user) {
      flow.author = req.user;
      flow.authorName = req.user.name;
    }

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

    return flow;
  };

  Move.list({}).then(function(moves) {
    var flow = generateFlow(moves);
    return Flow.populate(flow, 'moves.moves');
  }).then(function(flow) {
    return flow.saveAsync();
  }).then(function(flow) {
    res.jsonp(flow);
  }).then(null, next);
};

module.exports = function(app) {
  app.get('/api/flow/generate', generate);
  app.get('/api/flow', list);
  app.get('/api/flow/:flowId', getFlow);
  app.post('/api/flow', loadFlowFromBody, requireAuthorMatch, create);
  app.put('/api/flow/:flowId', requireAuthorMatch, update);
  app.delete('/api/flow/:flowId', requireAuthorMatch, deleteFlow);
  app.post('/api/flow/:flowId/likes', requireUserOrAnonId, like);
  app.delete('/api/flow/:flowId/likes', requireUserOrAnonId, removeLike);
  app.get('/api/flow/:flowId/likes', requireUserOrAnonId, hasLiked);
  app.post('/api/flow/:flowId/plays', requireUser, recordPlayed);

  app.param('flowId', loadById);
};
