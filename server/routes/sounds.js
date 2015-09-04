'use strict';

var config;

var buildRoot = function() {
  return 'http://' + config.s3.url + '/audio/';
};

var getRoot = function(req, res) {
  res.jsonp(buildRoot());
};

var getDoneSound = function(req, res) {
  res.jsonp(buildRoot() + 'flowFinished.mp3');
};

module.exports = function(app, _config) {
  config = _config;
  app.get('/api/sounds', getRoot);
  app.get('/api/sounds/done', getDoneSound);
};