'use strict';

var _ = function($window) {
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
  .factory('_', ['$window', _])
  .factory('environment', ['$window', environment]);