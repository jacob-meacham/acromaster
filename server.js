'use strict';

var express = require('express');

var env = process.env.NODE_ENV || /* istanbul ignore next: explicitly not testable */ 'development';
var config = require('./server/config/config')[env];
var passportConfig = require('./server/config/config').common;
var mongoose = require('mongoose');
var passport = require('passport');

var app = express();

// Hook up Mongoose.
mongoose.connect(config.dbUrl);

// Setup server
require('./server/config/passport').setupPassport(passport, passportConfig);

var expressConfig = require('./server/config/express');
expressConfig.setupApp(app, passport, config);

var version = process.env.VERSION || 'Development version';

// Hook up routes
require('./server/routes/auth').routes(app, passport);
require('./server/routes/flow')(app);
require('./server/routes/moves')(app);
require('./server/routes/user')(app);
require('./server/routes/sounds')(app, config);
require('./server/routes/index')(app, version, env);

// Needs to happen after routes are added
expressConfig.addErrorHandlers(app);

app.listen(config.app.port, config.app.hostname);
console.log('Acromaster started on port ' + config.app.hostname + ':' + config.app.port + ' (' + env + ')');

exports = module.exports = app;