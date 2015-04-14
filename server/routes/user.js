'use strict';

require('../models/user.js');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Flow = mongoose.model('Flow');

var loadFlows = function(req, cb) {
  Flow.listByUser(req.profile._id, function(err, flows) {
    console.log('listed flows');
    if (err) {
      console.log('err');
      return cb(err);
    }

    console.log('calling next ' + flows);
    req.profile.flows = flows;
    cb();
  });
};

var loadByName = function(req, res, next, name) {
  User.loadPublicProfile(name, function(err, profile) {
    console.log('Loaded public profile');
    if (err) {
      console.log('err' + err);
      return next(err);
    }
    
    if (!profile) {
      console.log('no profile');
      return next(new Error('User with name ' + name + ' does not exist'));
    }

    req.profile = profile;
    console.log('loading flows');
    loadFlows(req, next);
  });
};

var getUserProfile = function(req, res) {
  res.jsonp(req.profile);
};

module.exports = function(app) {
  app.get('/api/profile/:user', getUserProfile);
  app.param('user', loadByName);
};