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
    assetmanager = require('assetmanager'),
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

        var assets = assetmanager.process({
            assets: require('./assets.json'),
            debug: (process.env.NODE_ENV !== 'production'),
            webroot: 'public'
        });

        app.use(function (req, res, next) {
            res.locals.assets = assets;
            next();
        });
    },

    addErrorHandlers: function(app) {
        if (process.env.NODE_ENV === 'development') {
            // Dev error handler
            app.use(errorhandler({log: true}));
        } else if (process.env.NODE_ENV === 'production') {
            app.use(function(err, req, res, next) {
                console.error(err.stack);
                next(err);
            });
        }

        app.use(function(err, req, res) {
            // Return 500 to the client.
            res.status(500).send({ error: err });
        });
    }
};