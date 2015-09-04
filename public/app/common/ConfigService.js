'use strict';

var lodash = function($window) {
  return $window._;
};

var environment = function($window) {
  return {
    isDebug: function() {
      return $window.env === 'development';
    }
  };
};

angular.module('acromaster.services')
  .factory('_', ['$window', lodash])
  .factory('environment', ['$window', environment]);