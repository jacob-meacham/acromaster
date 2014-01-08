'use strict';

var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    helpers = require('view-helpers'),
    path = require('path');

module.exports = function(app, config) {
    app.set('showStackError', true);

    app.locals.pretty = true;

    app.use(express.favicon());

    // Don't use logger for test env
    if (config.useLogger) {
        app.use(express.logger('dev'));
    }

    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(app.directory, 'server/views'));
    app.set('view engine', 'jade');

    // Enable jsonp
    app.enable('jsonp callback');
    
    app.use(express.cookieParser());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());

    // express/mongo session storage
    app.use(express.session({
        secret: config.dbSecret,
        store: new mongoStore({
            url: config.db
        })
    }));

    app.use(helpers(config.app.name));
    
    app.use(express.static(path.join(app.directory, 'public')));
    app.use(app.router);
};