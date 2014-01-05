'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/..');
var _ = require('underscore');
var secret = require('./secret');

var config = {
    development: {
        db: process.env.MONGOHQ_URL || 'mongodb://localhost/am-dev',
        s3Url: 'localhost',
        s3Port: 10001,
        useLogger: true,
        root: rootPath,
        app: {
            name: 'Acromaster - Development'
        }
    },
    test: {
        db: process.env.MONGOHQ_URL || 'mongodb://localhost/am-test',
        s3Url: 'localhost',
        s3Port: 10001,
        root: rootPath,
        useLogger: false,
        app: {
            name: 'Acromaster - Test'
        }
    },
    production: {
        db:  process.env.MONGOHQ_URL,
        s3Url: 'localhost',
        s3Port: 10001,
        root: rootPath,
        useLogger: true,
        app: {
            name: 'Acromaster'
        }
    }
};

for (var env in config) {
    // Pull in all of the config that can't be checked in.
    _.extend(config[env], secret[env]);
}



module.exports = config;