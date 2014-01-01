'use strict';

var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    helpers = require('view-helpers');

module.exports = function(app, config) {
    app.set('showStackError', true);

    app.locals.pretty = true;

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
    app.enable('jsonp callback');
    
    app.use(express.cookieParser());
    app.use(express.json());
    app.use(express.urlencoded());
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