'use strict';

var config;

var buildRoot = function() {
  return 'http://' + config.s3.url + '/audio/';
};

var getRoot = function(req, res) {
  res.jsonp(buildRoot());
};

module.exports = function(app, _config) {
  config = _config;
  app.get('/api/sounds', getRoot);
};