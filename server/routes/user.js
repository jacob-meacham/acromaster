'use strict';

require('../models/user.js');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Flow = mongoose.model('Flow');

var loadByName = function(req, res, next, name) {
  User.loadPublicProfile(name).then(function(profile) {
    if (!profile) {
      return next({error: new Error('User with name ' + name + ' does not exist'), status: 404});
    }

    req.profile = profile;
    next();
  }).then(null, next);
};

var getUserProfile = function(req, res) {
  res.jsonp(req.profile);
};

var userMatch = function(req, res, next) {
  if (!req.user || req.params.username !== req.user.username) {
    return next({error: new Error('Not logged in or not authorized'), status: 401});
  }

  next();
};

var hasFavorited = function(req, res, next) {
  User.findOne({username: req.params.username, 'favorites.flow': req.params.flow}, function(err, user) {
    if(err) {
      return next(err);
    }

    res.jsonp({hasFavorited: !!user && !!user.favorites && !!user.favorites.length});
  });
};

var getFavorites = function(req, res) {
  res.jsonp({favorites: req.profile.favorites});
};

var getFlows = function(req, res) {
  var options = {};
  options.max = req.query.max;
  if (!options.max || options.max > 100) {
    options.max = 100;
  }
  options.page = (req.query.page > 0 ? req.query.page : 1) - 1;

  var flows;
  Flow.listByUser(req.profile.id, options).then(function(_flows) {
    flows = _flows;
    return Flow.countByUser(req.profile.id);
  }).then(function(count) {
    res.jsonp({flows: flows,
               page: options.page+1,
               total: count});
  });
};

var addFavorite = function(req, res, next) {
  req.user.addFavorite(req.params.flow).spread(function(user) {
    return res.jsonp(user);
  }).catch(next);
};

var removeFavorite = function(req, res, next) {
  req.user.removeFavorite(req.params.flow).then(function(user) {
    return res.jsonp(user);
  }).catch(next);
};

module.exports = function(app) {
  app.get('/api/profile/:user', getUserProfile);
  app.get('/api/profile/:user/favorites', getFavorites);
  app.get('/api/profile/:user/flows', getFlows);
  app.get('/api/profile/:username/favorites/:flow', hasFavorited);
  app.post('/api/profile/:username/favorites/:flow', userMatch, addFavorite);
  app.delete('/api/profile/:username/favorites/:flow', userMatch, removeFavorite);
  app.param('user', loadByName);
};
