'use strict';

require('../models/user.js');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Flow = mongoose.model('Flow');

var loadFlows = function(profile, next) {
  Flow.listByUser(profile.id, function(err, flows) {
    if (err) {
      return next(err);
    }

    profile.flows = flows;
    next();
  });
};

var loadByName = function(req, res, next, name) {
  User.loadPublicProfile(name, function(err, profile) {
    if (err) {
      return next(err);
    }
    
    if (!profile) {
      return next(new Error('User with name ' + name + ' does not exist'));
    }

    req.profile = profile;
    loadFlows(req.profile, next);
  });
};

var getUserProfile = function(req, res) {
  res.jsonp(req.profile);
};

var userMatch = function(req, res, next) {
  if (!req.user || req.params.userId !== req.user._id) {
    return res.status(401).send({error: new Error('Not logged in or not authorized')});
  }

  next();
};

var hasFavorited = function(req, res, next) {
  User.find({_id: req.params.userId, 'favorites.flow': req.params.flowId}, function(err, flows) {
    if(err) {
      return next(err);
    }

    res.jsonp({hasFavorited: !!flows.length});
  });
};

var getFavorites = function(req, res) {
  res.jsonp({favorites: req.profile.favorites});
};

var getFlows = function(req, res, next) {
  Flow.listByUser(req.params.userId).then(function(flows) {
    res.jsonp({flows: flows});
  }).then(null, next); // Pass any errors along to next.
};

var addFavorite = function(req, res, next) {
  req.user.addFavorite(req.params.flowId, function(err, user) {
    if (err) {
      return next(err);
    }

    return res.jsonp(user);
  });
};

var removeFavorite = function(req, res, next) {
  req.user.removeFavorite(req.params.flowId, function(err, user) {
    if (err) {
      return next(err);
    }

    return res.jsonp(user);
  });
};

module.exports = function(app) {
  app.get('/api/profile/:user', getUserProfile);
  app.get('/api/profile/:user/favorites', getFavorites);
  app.get('/api/profile/:userId/flows', getFlows);
  app.get('/api/profile/:userId/favorites/:flowId', hasFavorited);
  app.post('/api/profile/:userId/favorites/:flowId', userMatch, addFavorite);
  app.delete('/api/profile/:userId/favorites/:flowId', userMatch, removeFavorite);
  app.param('user', loadByName);
};