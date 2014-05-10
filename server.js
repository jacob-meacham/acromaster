'use strict';

var express = require('express');

var env = process.env.NODE_ENV || 'development';
var config = require('./server/config/config')[env];
var mongoose = require('mongoose');

var app = express();

// Hook up Mongoose.
mongoose.connect(config.dbUrl);

// Setup server
require('./server/config/express')(app, config);

// Hook up routes
[
  './server/routes/flow',
  './server/routes/index'
].forEach(function (routePath) {
    require(routePath)(app);
});

app.listen(config.app.port, config.app.hostname);
console.log('Express app started on port ' + config.app.hostname + ':' + config.app.port + ' (' + env + ')');

exports = module.exports = app;