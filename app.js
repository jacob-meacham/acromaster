var express = require('express'),
    fs = require('fs');

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];
var mongoose = require('mongoose');

var app = express();

// Hook up Mongoose.
mongoose.connect(config.db);

// Setup server
require('./config/express')(app, config);

// Hook up routes
[
  "./server/routes/movelist",
  "./server/routes/index"
].forEach(function (routePath) {
    require(routePath)(app);
});

//expose app
exports = module.exports = app;