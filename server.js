/**
 * Module dependencies.
 */
var express = require('express'),
    fs = require('fs');

var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env],
    mongoose = require('mongoose');

var db = mongoose.connect(config.db);

// Add models
var models_path = __dirname + '/server/models';
fs.readdirSync(models_path).forEach(function(file) {
    require(models_path + '/' + file);
});

var app = express();

// Setup server
require('./config/express')(app, config);

// Hook up routes
require('./server/routes/movelist')(app);

require('http').createServer(app).listen(app.get('port'), function () {
    console.log('Express (' + app.get('env') + ') server listening on port ' + app.get('port'));
});

//expose app
exports = module.exports = app;