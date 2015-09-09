'use strict';

var Promise = require('bluebird');
var Flow = require('../models/flow');
var Move = require('../models/move');

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

var updateFlow = function(req, res, next) {
  loadById(req, res, next, req.flow._id);
};

var requireAuthorMatch = function(req, res, next) {
  if (req.flow.author) {
    if (!req.isAuthenticated() || req.user._id !== req.flow.author._id) {
      return next({error: new Error('This flow doesn\'t belong to you'), status: 401});
    }
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
  Flow.findRandom({workout: false}, '-moves -plays -likers').populate('author', 'name username _id profilePictureUrl').limit(max).exec().then(function(flows) {
    res.jsonp({
      flows: flows,
      total: max
    });
  }).then(null, next); // Pass errors directly to next
};

var _listInternal = function(req, res, next) {
  var page = (req.query.page > 0 ? req.query.page : 1) - 1;
  var wantCount = req.query.count || true;
  var max = _getMax(req);

  var options = {
    page: page,
    max: max,
    searchQuery: {}
  };

  if (req.query.search_query) {
    options.searchQuery = { $text: { $search : req.query.search_query } };
    options.score = { $meta: 'textScore' };
    options.sortBy = { score: options.score };
  }

  var flows = null;
  Flow.list(options).then(function(_flows) {
    flows = _flows;
    if (wantCount) {
      return Flow.count(options.searchQuery).exec();
    }
    return 0;
  }).then(function(count) {
    res.jsonp({
      flows: flows,
      page: page+1,
      total: count
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

var _validateFlow = function(flow) {
  if (!flow.name || flow.name.length > 50 || flow.name.length < 3) {
    return {error: 'Flow must have a name, and the name must be between 3 and 50 characters', status: 400};
  }

  if (!flow.moves || flow.moves.length === 0 || flow.moves.length > 200) {
    return {error: 'Flow must have moves, and there must be fewer than 200 moves', status: 400};
  }

  if (flow.description && flow.description.length > 500) {
    return {error: 'Description must be less than 500 characters', status: 400};
  }

  return {};
};

var create = function(req, res, next) {
  var flow = req.flow;
  if (req.user) {
    flow.author = req.user;
    flow.authorName = req.user.name;

    // We actually created this, so lets write it down
    if (!flow.workout) {
      req.user.recordFlowWritten(); // Async is totally fine - we can just throw errors on the floor.
    }
  }

  var validation = _validateFlow(flow);
  if (validation.error) {
    return next(validation);
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

  var validation = _validateFlow(flow);
  if (validation.error) {
    return next(validation.error);
  }

  flow.saveAsync().then(function() {
    res.jsonp(flow);
  }).catch(next);
};

var deleteFlow = function(req, res, next) {
  req.flow.removeAsync().then(function() {
    res.status(200).send({});
  }).catch(next);
};

var like = function(req, res, next) {
  req.flow.like(req.userId, function(err) {
    if (err) { next(err); }

    next();
  });
};

var removeLike = function(req, res, next) {
  req.flow.cancelLike(req.userId, function(err) {
    if (err) { return next(err); }

    next();
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
  var promises = [];
  var userId;
  if (req.user) {
    userId = req.user._id;
    promises.push(req.user.recordPlay(req.flow));
  } else {
    promises.push({});
  }

  promises.push(Flow.recordPlayed(req.flow._id, userId));
  Promise.all(promises).spread(function(user, flow) {
    res.jsonp({flow: flow, plays: flow.plays});
  }).catch(next);
};

var generate = function(req, res, next) {
  var parse = function(num) {
    var parsed = parseFloat(num);
    return isNaN(parsed) ? 0 : parsed;
  };

  if (!('totalTime' in req.query) || !('timePerMove' in req.query)) {
    return next({error: 'totalTime and timePerMove required', status: 400});
  }

  var totalTime = parse(req.query.totalTime);
  var timePerMove = parse(req.query.timePerMove);

  if (timePerMove <= 0 || timePerMove > 1000) {
    return next({error: 'timePerMove must be positive and <= 1000', status: 400});
  }

  if (totalTime <= 0 || totalTime > 7500) {
    return next({error: 'totalTime must be positive and <= 7500', status: 400});
  }

  var generateFlow = function(all_moves) {
    // Construct a new list using the passed parameters
    var flow = new Flow();
    flow.name = 'Quick Flow';
    flow.workout = true;

    if (req.query.flowName) {
      flow.name = req.query.flowName;
    }

    if (req.query.imageUrl) {
      flow.imageUrl = req.query.imageUrl;
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
      var moveDuration = Math.floor(timePerMove + Math.random() * timeVariance);
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

  var criteria = {};
  if (req.query.difficulty) {
    criteria.difficulty = { $lte: req.query.difficulty };
  }
  Move.list(criteria).then(function(moves) {
    var flow = generateFlow(moves);
    return Flow.populate(flow, 'moves.move');
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
  app.post('/api/flow/:flowId/likes', requireUserOrAnonId, like, updateFlow, getFlow); // after liking, update and return the flow
  app.delete('/api/flow/:flowId/likes', requireUserOrAnonId, removeLike, updateFlow, getFlow); // after removing the like, update and return the flow
  app.get('/api/flow/:flowId/likes', requireUserOrAnonId, hasLiked);
  app.post('/api/flow/:flowId/plays', recordPlayed);

  app.param('flowId', loadById);
};
