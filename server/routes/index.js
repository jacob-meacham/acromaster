'use strict';
var versionString = '';

var index = function(req, res) {
    res.render('index', {
      user: req.user ? req.user : {},
      version: versionString
    });
};

var version = function(req, res) {
  res.jsonp(versionString);
};

module.exports = function(app, _versionString) {
  versionString = _versionString;
  app.get('/', index);
  app.get('/version', version);

  // Wildcard catchall
  app.get('*', index);
};