'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');
var _ = require('lodash');

// TODO: Cleanup base URL vs hostname
var config = {
    development: {
        app: {
            name: 'Acromaster - Development',
            port: process.env.PORT || 3000,
            hostname: process.env.HOST || process.env.HOSTNAME || '0.0.0.0',
            baseUrl: process.env.BASE_URL || 'http://127.0.0.1:3000'
        },
        session: {
            secret: 'acromaster',
            collection: 'sessions'
        },
        dbUrl: 'mongodb://127.0.0.1/am-dev',
        root: rootPath,

        s3: {
            url: 'localhost:10001',
            key: 's3key',
            secret: 's3secret'
        }
    },
    test: {
        app: {
            name: 'Acromaster - Test',
            port: process.env.PORT || 3000,
            hostname: undefined,
            baseUrl: process.env.BASE_URL
        },
        session: {
            secret: 'acromaster',
            collection: 'sessions'
        },
        dbName: 'am-test',
        dbUrl: 'mongodb://localhost/am-test',
        root: rootPath,

        s3: {
            url: 'localhost:10001',
            key: 's3key',
            secret: 's3secret'
        }
    },
    production: {
        app: {
            name: 'Acromaster',
            port: process.env.PORT || 3000,
            hostname: process.env.HOST || process.env.HOSTNAME,
            baseUrl: process.env.BASE_URL
        },
        session: {
            secret: process.env.DB_SECRET,
            collection: 'sessions'
        },
        dbUrl: process.env.MONGO_URL,
        root: rootPath,

        s3: {
            url: 'acromaster.s3.amazonaws.com',
            key: process.env.S3_KEY,
            secret: process.env.S3_SECRET,
        }
    }
};

// TODO: Cleanup?
_(['development', 'test', 'production']).forEach(function(env) {
    config[env].auth = {
        facebook: {
            clientID: process.env.FACEBOOK_ID || 'FAKE',
            clientSecret: process.env.FACEBOOK_SECRET || 'FAKE',
            callbackUrl: config[env].app.baseUrl + '/auth/facebook/callback'
        },
        twitter: {
            clientID: process.env.TWITTER_ID || 'FAKE',
            clientSecret: process.env.TWITTER_SECRET || 'FAKE',
            callbackUrl: config[env].app.baseUrl + '/auth/twitter/callback'
        },
        google: {
            clientID: process.env.GOOGLE_ID || 'FAKE',
            clientSecret: process.env.GOOGLE_SECRET || 'FAKE',
            callbackUrl: config[env].app.baseUrl + '/auth/google/callback'
        }
    };
});

module.exports = config;
