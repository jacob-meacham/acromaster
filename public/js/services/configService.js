'use strict';
var services = angular.module('acromaster.services');

services.factory('_', ['$window', function($window) {
    return $window._;
  }]);

services.factory('environment', ['$window', function($window) {
  return {
    isDebug: function() {
      //return $window.env === 'development';
      return true;
    }
  };
}]);