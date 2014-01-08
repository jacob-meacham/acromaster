'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var config = {
    development: {
        db: process.env.MONGOHQ_URL || 'mongodb://localhost/am-dev',
        dbSecret: process.env.MONGOSECRET || 'acromaster',
        useLogger: true,
        root: rootPath,
        app: {
            name: 'Acromaster - Development'
        },

        s3: {
            key: process.env.S3_KEY || 's3key',
            secret: process.env.S3_SECRET || 's3secret',
            url: process.env.S3_URL || 'localhost',
            port: 10001
        }
    },
    test: {
        db: process.env.MONGOHQ_URL || 'mongodb://localhost/am-test',
        dbSecret: process.env.MONGOSECRET || 'acromaster',
        root: rootPath,
        useLogger: false,
        app: {
            name: 'Acromaster - Test'
        },

        s3: {
            key: process.env.S3_KEY || 's3key',
            secret: process.env.S3_SECRET || 's3secret',
            url: process.env.S3_URL || 'localhost',
            port: 10001
        }
    },
    production: {
        db:  process.env.MONGOHQ_URL,
        dbSecret: process.env.MONGOSECRET,
        root: rootPath,
        useLogger: true,
        app: {
            name: 'Acromaster'
        },

        s3: {
            key: process.env.S3_KEY,
            secret: process.env.S3_SECRET,
            url: process.env.S3_URL,
            port: 10001
        }
    }
};

module.exports = config;