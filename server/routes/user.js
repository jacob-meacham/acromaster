'use strict';

require('../models/user.js');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Flow = mongoose.model('Flow');

var loadByName = function(req, res, next, name) {
  User.loadPublicProfile(name, function(err, profile) {
    if (err) {
      return next(err);
    }
    
    if (!profile) {
      return next({error: new Error('User with name ' + name + ' does not exist'), status: 404});
    }

    req.profile = profile;
    Flow.listByUser(req.profile.id).then(function(flows) {
      profile.flows = flows;
      next();
    }).then(null, next);
  });
};

var getUserProfile = function(req, res) {
  res.jsonp(req.profile);
};

var userMatch = function(req, res, next) {
  if (!req.user || req.params.userId !== req.user._id) {
    return next({error: new Error('Not logged in or not authorized'), status: 401});
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

var getFlows = function(req, res) {
  res.jsonp({flows: req.profile.flows});
};

var addFavorite = function(req, res, next) {
  req.user.addFavorite(req.params.flowId).spread(function(user) {
    return res.jsonp(user);
  }).catch(next);
};

var removeFavorite = function(req, res, next) {
  req.user.removeFavorite(req.params.flowId).spread(function(user) {
    return res.jsonp(user);
  }).catch(next);
};

module.exports = function(app) {
  app.get('/api/profile/:user', getUserProfile);
  app.get('/api/profile/:user/favorites', getFavorites);
  app.get('/api/profile/:user/flows', getFlows);
  app.get('/api/profile/:userId/favorites/:flowId', hasFavorited);
  app.post('/api/profile/:userId/favorites/:flowId', userMatch, addFavorite);
  app.delete('/api/profile/:userId/favorites/:flowId', userMatch, removeFavorite);
  app.param('user', loadByName);
};