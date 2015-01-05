'use strict';

require('../models/user.js');
var mongoose = require('mongoose'),
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    User = mongoose.model('User');


module.exports = function(passport, config) {
    //Serialize sessions
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findOne({
            _id: id
        }, '-salt -hashed_password', function(err, user) {
            done(err, user);
        });
    });


    //Use twitter strategy
    passport.use(new TwitterStrategy({
            consumerKey: config.auth.twitter.clientID,
            consumerSecret: config.auth.twitter.clientSecret,
            callbackURL: config.auth.twitter.callbackURL
        },
        function(token, tokenSecret, profile, done) {
            User.findOne({
                'twitter.id_str': profile.id
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        username: profile.username,
                        provider: 'twitter',
                        twitter: profile._json
                    });
                    user.save(function(err) {
                        if (err) console.log(err);
                        return done(err, user);
                    });
                } else {
                    return done(err, user);
                }
            });
        }
    ));

    //Use facebook strategy
    passport.use(new FacebookStrategy({
            clientID: config.auth.facebook.clientID,
            clientSecret: config.auth.facebook.clientSecret,
            callbackURL: config.auth.facebook.callbackUrl
        },
        function(accessToken, refreshToken, profile, done) {
            console.log('Getting');
            User.findOne({
                'facebook.id': profile.id
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        username: profile.username,
                        provider: 'facebook',
                        facebook: profile._json
                    });
                    user.save(function(err) {
                        if (err) console.log(err);
                        return done(err, user);
                    });
                } else {
                    return done(err, user);
                }
            });
        }
    ));

    //Use google strategy
    passport.use(new GoogleStrategy({
            clientID: config.auth.google.clientID,
            clientSecret: config.auth.google.clientSecret,
            callbackURL: config.auth.google.callbackUrl
        },
        function(accessToken, refreshToken, profile, done) {
            User.findOne({
                'google.id': profile.id
            }, function(err, user) {
                if (!user) {
                    user = new User({
                        name: profile.name,
                        email: profile.email,
                        provider: 'google',
                        google: profile._json
                    });
                    user.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                        return done(err, user);
                    });
                } else {
                    return done(err, user);
                }
            });
        }
    ));
};