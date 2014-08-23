'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

var config = {
    common: {
        auth: {
            facebook: {
                clientID: '1571422493085485',
                clientSecret: 'fd54d250051833b88db625275f95cc02',
                callbackUrl: 'http://localhost:3000/auth/facebook/callback'
            },
            twitter: {
                /*
                clientID: process.env.TWITTER_ID,
                clientSecret: process.env.TWITTER_SECRET,
                */
                clientID: '45DXHdEozkOykBCzEgmfrTmRL',
                clientSecret: '9hTESkWDoawYupjOvsqGtDIKMTPwqVHO42dannNeyzYDgSOZCC',
                callbackUrl: 'http://localhost:3000/auth/twitter/callback'
            },
            google: {
                clientID: '670350064075-frr7h9tvc0php8lf1c9jtc90674e4vk0.apps.googleusercontent.com',
                clientSecret: 'l-acUsQCScrTcXZugLkYHbou',
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
            url: 'localhost',
            key: 's3key',
            secret: 's3secret',
            port: 10001
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
            url: 'localhost',
            key: 's3key',
            secret: 's3secret',
            port: 10001
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
        dbUrl:  process.env.MONGOHQ_URL,
        root: rootPath,

        s3: {
            url: 'acromaster.s3.amazonaws.com',
            key: process.env.S3_KEY,
            secret: process.env.S3_SECRET,
        }
    }
};

module.exports = config;