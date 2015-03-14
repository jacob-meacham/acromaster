'use strict';

require('../models/user.js');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var loadByName = function(req, res, next, name) {
  User.loadPublicProfile(name, function(err, profile) {
    if (err) {
      return next(err);
    }
    
    if (!profile) {
      return next(new Error('User with name ' + name + ' does not exist'));
    }

    req.profile = profile;
    next();
  });
};

var getUserProfile = function(req, res) {
  res.jsonp(req.profile);
};

module.exports = function(app) {
  app.get('/api/profile/:user', getUserProfile);
  app.param('user', loadByName);
};