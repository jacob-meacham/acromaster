/**
 * Module dependencies.
 */
var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    helpers = require('view-helpers');

module.exports = function(app, config) {
    app.set('showStackError', true);

    app.use(express.favicon());
    app.use(express.static(config.root + '/public'));

    // Don't use logger for test env
    if (config.useLogger) {
        app.use(express.logger('dev'));
    }

    app.set('port', process.env.PORT || 3000);
    app.set('views', config.root + '/server/views');
    app.set('view engine', 'jade');

    // Enable jsonp
    app.enable("jsonp callback");
    
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // express/mongo session storage
    app.use(express.session({
        secret: 'AcroMaster',
        store: new mongoStore({
            url: config.db
        })
    }));

    app.use(helpers(config.app.name));
    app.use(app.router);
};