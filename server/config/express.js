'use strict';

var express = require('express'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    helpers = require('view-helpers'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressValidator = require('express-validator'),
    errorhandler = require('errorhandler'),
    favicon = require('static-favicon'),
    flash = require('connect-flash'),
    morgan = require('morgan'),
    path = require('path');

module.exports = {
    setupApp: function(app, passport, config) {
        app.set('showStackError', false);

        app.locals.pretty = true;

        if (process.env.NODE_ENV === 'development') {
            app.use(morgan('dev'));
        }

        app.set('views', path.join(config.root, 'server/views'));
        app.set('view engine', 'jade');

        // Enable jsonp
        app.enable('jsonp callback');

        app.use(cookieParser());
        app.use(expressValidator());
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
        app.use(methodOverride());

        // express/mongo session storage
        app.use(session({
            secret: config.session.secret,
            store: new mongoStore({
                url: config.dbUrl,
                collection: config.session.collection
            }),
            resave: true,
            saveUninitialized: true
        }));

        app.use(helpers(config.app.name));

        app.use(passport.initialize());
        app.use(passport.session());

        app.use(flash());
        app.use(favicon());

        app.use(express.static(path.join(config.root, 'public')));
    },

    addErrorHandlers: function(app) {
        if (process.env.NODE_ENV === 'development') {
            app.use(errorhandler({log: false}));
        }
    }
};