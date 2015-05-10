'use strict';

require('../models/user.js');

var authCallback = function(req, res) {
  res.redirect('/');
};

var login = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.redirect('/login');
};

var getUser = function(req, res) {
  res.json(req.user || null);
};

var isLoggedIn = function(req, res) {
  res.send(req.isAuthenticated() ? req.user : '0');
};

module.exports = {
  routes: function(app, passport) {
    app.route('/auth/currentUser').get(getUser);
    app.route('/auth/loggedin').get(isLoggedIn);
    app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
    });

    // Facebook oauth
    app.route('/auth/facebook')
      .get(passport.authenticate('facebook', {
        scope: ['email', 'user_about_me'],
        failureRedirect: '/login'
      }), login);

    app.route('/auth/facebook/callback')
      .get(passport.authenticate('facebook', {
        failureRedirect: '/login'
      }), authCallback);

    // Twitter oauth
    app.route('/auth/twitter')
      .get(passport.authenticate('twitter', {
        failureRedirect: '/login'
      }), login);

    app.route('/auth/twitter/callback')
      .get(passport.authenticate('twitter', {
        failureRedirect: '/login'
      }), authCallback);

    // Google oauth
    app.route('/auth/google')
      .get(passport.authenticate('google', {
        failureRedirect: '/login',
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ]
      }), login);

    app.route('/auth/google/callback')
      .get(passport.authenticate('google', {
        failureRedirect: '/login'
      }), authCallback);
  },

  // Exposed for tests only
  _login: login,
  _authCallback: authCallback
};
