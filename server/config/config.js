'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

var config = {
    development: {
        app: {
            name: 'Acromaster - Development',
            port: process.env.PORT || 3000,
            hostname: 'localhost' || process.env.HOST || process.env.HOSTNAME
        },
        session: {
            secret: 'acromaster',
            collection: 'sessions'
        },
        dbUrl: 'mongodb://localhost/am-dev',
        root: rootPath,

        s3: {
            url: 'localhost/acromaster',
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
            url: 'localhost/acromaster',
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