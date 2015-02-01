'use strict';

// Karma configuration
module.exports = function(config) {
  var _ = require('lodash');
  var assets = require('./server/config/assets.json');

  config.set({
    files: _.flatten(_.values(assets.vendor.js)).concat([
      'public/lib/angular-mocks/angular-mocks.js',
      'public/js/*.js',
      'public/js/**/*.js',
      'test/client/**/*spec.js'
    ]),
    
    frameworks: ['mocha', 'chai', 'sinon', 'sinon-chai'],
    
    browsers: ['PhantomJS'],
    
    reporters: ['mocha', 'coverage'],
    
    coverageReporter: {
        type: 'lcov',
        dir: 'build/coverage/client'
    },
    
    preprocessors: {
        'public/js/**/*.js' : 'coverage'
    },
    
    autoWatch: false,
    colors: true
  });
};
