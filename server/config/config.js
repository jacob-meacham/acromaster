'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

var config = {
    common: {
        auth: {
            facebook: {
                clientID: process.env.FACEBOOK_ID,
                clientSecret: process.env.FACEBOOK_SECRET,
                callbackUrl: 'http://localhost:3000/auth/facebook/callback'
            },
            twitter: {
                clientID: process.env.TWITTER_ID,
                clientSecret: process.env.TWITTER_SECRET,
                callbackUrl: 'http://localhost:3000/auth/twitter/callback'
            },
            google: {
                clientID: process.env.GOOGLE_ID,
                clientSecret: process.env.GOOGLE_SECRET,
                callbackUrl: 'http://localhost:3000/auth/google/callback'
            }
        }
    },
    development: {
        app: {
            name: 'Acromaster - Development',
            port: process.env.PORT || 3000,
            hostname: '0.0.0.0' || process.env.HOST || process.env.HOSTNAME
        },
        session: {
            secret: 'acromaster',
            collection: 'sessions'
        },
        dbUrl: 'mongodb://localhost/am-dev',
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
            hostname: process.env.HOST || process.env.HOSTNAME
        },
        session: {
            secret: 'acromaster',
            collection: 'sessions'
        },
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
            hostname: process.env.HOST || process.env.HOSTNAME
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

module.exports = config;