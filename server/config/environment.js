'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

var config = {
    development: {
        db: process.env.MONGOHQ_URL || 'mongodb://localhost/am-dev',
        dbSecret: 'acromaster',
        useLogger: true,
        root: rootPath,
        app: {
            name: 'Acromaster - Development'
        },

        s3: {
            url: 'localhost/acromaster',
            key: process.env.S3_KEY || 's3key',
            secret: process.env.S3_SECRET || 's3secret',
            port: 10001
        }
    },
    test: {
        db: process.env.MONGOHQ_URL || 'mongodb://localhost/am-test',
        dbSecret: 'acromaster',
        root: rootPath,
        useLogger: false,
        app: {
            name: 'Acromaster - Test'
        },

        s3: {
            url: 'localhost/acromaster',
            key: process.env.S3_KEY || 's3key',
            secret: process.env.S3_SECRET || 's3secret',
            port: 10001
        }
    },
    production: {
        db:  process.env.MONGOHQ_URL,
        dbSecret: process.env.DB_SECRET,
        root: rootPath,
        useLogger: true,
        app: {
            name: 'Acromaster'
        },

        s3: {
            url: 'acromaster.s3.amazonaws.com',
            key: process.env.S3_KEY,
            secret: process.env.S3_SECRET,
        }
    }
};

module.exports = config;