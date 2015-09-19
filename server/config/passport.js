'use strict';

require('../models/user.js');
var winston = require('winston');
var mongoose = require('mongoose');
var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = mongoose.model('User');

var deserializeUser = function(id, done) {
    User.findOne({
        _id: id
    }, function(err, user) {
        done(err, user);
    });
};

var userCallback = function(profile, idProp, userCreator, done) {
    var query = {};
    query[idProp] = profile.id;
    User.findOne(query, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            // Create the user and then set properties common to all providers
            user = userCreator(profile);
            user.email = profile.emails ? profile.emails[0].value : null;
            user.save(function(err) {
                return done(err, user);
            });
        } else {
            return done(err, user);
        }
    });
};

var twitterCallback = function(token, tokenSecret, profile, done) {
    var userCreator = function(profile) {
        return new User({
            name: profile.username,
            profilePictureUrl: profile.photos ? profile.photos[0].value : null,
            provider: 'twitter',
            twitter: profile._json
        });
    };
    userCallback(profile, 'twitter.id_str', userCreator, done);
};

var facebookCallback = function(accessToken, refreshToken, profile, done) {
    var userCreator = function(profile) {
        return new User({
            name: profile.displayName,
            profilePictureUrl: profile.photos ? profile.photos[0].value : null,
            provider: 'facebook',
            facebook: profile._json
        });
    };
    userCallback(profile, 'facebook.id', userCreator, done);
};

var googleCallback = function(accessToken, refreshToken, profile, done) {
    var userCreator = function(profile) {
        return new User({
            name: profile.displayName,
            profilePictureUrl: profile._json.picture,
            provider: 'google',
            google: profile._json
        });
    };
    userCallback(profile, 'google.id', userCreator, done);
};

function setupStrategy(passport, name, Strategy, config, callback, profileFields) {
    if (config.clientID === 'FAKE' || config.clientSecret === 'FAKE') {
        winston.warn('Your client id or secret has not been specified for ' + name + ' (' + name.toUpperCase() + '_ID/' + name.toUpperCase() + '_SECRET). Logging in via this system will not work.');
    }

    passport.use(new Strategy({
        consumerKey: config.clientID,
        consumerSecret: config.clientSecret,
        clientID: config.clientID,
        clientSecret: config.clientSecret,
        callbackURL: config.callbackUrl,
        profileFields: profileFields
    }, callback));
}

module.exports = {
    setupPassport: function(passport, config) {
        //Serialize sessions
        passport.serializeUser(function(user, done) {
            done(null, user.id);
        });

        passport.deserializeUser(deserializeUser);

        setupStrategy(passport, 'twitter', TwitterStrategy, config.twitter, twitterCallback);
        setupStrategy(passport, 'facebook', FacebookStrategy, config.facebook, facebookCallback, ['id', 'name', 'displayName', 'photos']);
        setupStrategy(passport, 'google', GoogleStrategy, config.google, googleCallback);
    },

        // Exposed for unit testing
    _deserializeUser: deserializeUser,
    _twitterCallback: twitterCallback,
    _facebookCallback: facebookCallback,
    _googleCallback: googleCallback
};