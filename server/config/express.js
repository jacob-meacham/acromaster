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
    assetmanager = require('assetmanager'),
    morgan = require('morgan'),
    winston = require('winston'),
    path = require('path');

module.exports = {
    setupApp: function(app, passport, config) {
        app.set('showStackError', false);

        app.locals.pretty = true;

        if (process.env.NODE_ENV === 'development') {
            app.set('showStackError', true);
            app.use(morgan('dev'));
        } else if (process.env.NODE_ENV === 'production') {
            app.use(morgan('common', {
                skip: function(req, res) {
                    return res.statusCode < 400;
                }
            }));
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
        app.use(function(err, req, res, next) {
            /* istanbul ignore next: explicitly not testable */
            if (process.env.NODE_ENV !== 'test') {
                /* istanbul ignore next */
                winston.error(err.stack);
            }
            next(err);
        });

        // jshint unused:false
        app.use(function(err, req, res, next) {
            if (err.status) {
                return res.status(err.status).send({ error: (err.error ? err.error.toString() : err) }); // Use toString because instances of Error don't JSON.stringify well.
            }
            
            // Return 500 to the client.
            res.status(500).send({ error: err.toString() });
        });
    }
};