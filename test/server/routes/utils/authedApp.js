'use strict';

var express = require('express');
var User = require('../../../server/models/user.js');

module.exports = function(app, _user) {
	var user = _user;
	if (user === null) {
		user = new User({
			name: 'Abigail',
      email: 'abigial.test@test.com'
		});
	}

  var authedApp;
  var reset = function() {
    return build(user);
  };

  var build = function(requestedUser) {
    authedApp = express();
    authedApp.all('*', function(req, res, next) {
      req.user = requestedUser;
      next();
    });
    authedApp.use(app);
    return authedApp;
  };

  reset();
  return {
    app: authedApp,
    reset: reset,
    withUser: function(user) {
      return build(user);
    }
  };
};
