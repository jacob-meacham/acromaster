'use strict';

// Karma configuration
module.exports = function(config) {
  var _ = require('lodash');
  var assets = require('./server/config/assets.json');

  config.set({
    files: _.flatten(_.values(assets.vendor.js)).concat([
      'test/client/globals.js',
      'public/assets/lib/angular-mocks/angular-mocks.js',
      'public/app/*.js',
      'public/app/**/*.js',
      'test/client/**/*spec.js',
      'public/app/**/*.html'
    ]),
    
    frameworks: ['mocha', 'chai', 'sinon', 'sinon-chai'],
    
    browsers: ['PhantomJS'],
    reporters: ['mocha', 'coverage'],
    
    coverageReporter: {
        type: 'lcov',
        dir: 'build/coverage/client'
    },
    
    preprocessors: {
      'public/app/**/*.js' : 'coverage',
      'public/app/**/*.html' : 'ng-html2js'
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'public/',
      moduleName: 'acromaster.templates'
    },
    
    autoWatch: false,
    colors: true
  });
};
