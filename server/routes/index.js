'use strict';
var os = require('os');
var versionString = '';
var env = '';

var index = function(req, res) {
  res.render('index', {
    user: req.user ? req.user : {},
    env: env,
    hostname: os.hostname()
  });
};

var version = function(req, res) {
  res.jsonp(versionString);
};

module.exports = function(app, _versionString, _env) {
  versionString = _versionString;
  env = _env;
  app.get('/', index);
  app.get('/version', version);

  // Wildcard catchall
  app.get('*', index);
};