'use strict';

var express = require('express'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    helpers = require('view-helpers'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressValidator = require('express-validator'),
    favicon = require('static-favicon'),
    flash = require('connect-flash'),
    morgan = require('morgan'),
    path = require('path');

module.exports = function(app, passport, config) {
    app.set('showStackError', true);

    app.locals.pretty = true;

    // Don't use logger for test env
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    app.set('views', path.join(config.root, 'server/views'));
    app.set('view engine', 'jade');

    // Enable jsonp
    app.enable('jsonp callback');

    app.use(cookieParser());
    app.use(expressValidator());
    app.use(bodyParser());
    app.use(methodOverride());

    // express/mongo session storage
    app.use(session({
        secret: config.session.secret,
        store: new mongoStore({
            url: config.dbUrl,
            collection: config.session.collection
        })
    }));

    app.use(helpers(config.app.name));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(flash());
    app.use(favicon());

    app.use(express.static(path.join(config.root, 'public')));
};