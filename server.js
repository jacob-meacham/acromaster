'use strict';

var fs = require('fs');
var express = require('express');

var env = process.env.NODE_ENV || 'development';
var config = require('./server/config/config')[env];
var passportConfig = require('./server/config/config').common;
var mongoose = require('mongoose');
var passport = require('passport');

var app = express();

// Hook up Mongoose.
mongoose.connect(config.dbUrl);

// Setup server
require('./server/config/passport')(passport, passportConfig);
require('./server/config/express')(app, passport, config);

var version = 'Development version';
if (fs.existsSync('acromaster.version')) {
  version = fs.readFileSync('acromaster.version', { encoding: 'utf-8' });
}

// Hook up routes
require('./server/routes/auth')(app, passport);
require('./server/routes/flow')(app);
require('./server/routes/index')(app, version);

app.listen(config.app.port, config.app.hostname);
console.log('Acromaster started on port ' + config.app.hostname + ':' + config.app.port + ' (' + env + ')');

exports = module.exports = app;