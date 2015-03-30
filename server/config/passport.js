'use strict';

require('../models/user.js');
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

module.exports = {
    setupPassport: function(passport, config) {
        //Serialize sessions
        passport.serializeUser(function(user, done) {
            done(null, user.id);
        });

        passport.deserializeUser(deserializeUser);

        //Use twitter strategy
        passport.use(new TwitterStrategy({
                consumerKey: config.auth.twitter.clientID,
                consumerSecret: config.auth.twitter.clientSecret,
                callbackURL: config.auth.twitter.callbackURL
            }, twitterCallback));

        //Use facebook strategy
        passport.use(new FacebookStrategy({
                clientID: config.auth.facebook.clientID,
                clientSecret: config.auth.facebook.clientSecret,
                callbackURL: config.auth.facebook.callbackUrl,
                profileFields: ['id', 'name', 'displayName', 'photos']
            }, facebookCallback));

        //Use google strategy
        passport.use(new GoogleStrategy({
                clientID: config.auth.google.clientID,
                clientSecret: config.auth.google.clientSecret,
                callbackURL: config.auth.google.callbackUrl
            }, googleCallback));
    },

        // Exposed for unit testing
    _deserializeUser: deserializeUser,
    _twitterCallback: twitterCallback,
    _facebookCallback: facebookCallback,
    _googleCallback: googleCallback
};