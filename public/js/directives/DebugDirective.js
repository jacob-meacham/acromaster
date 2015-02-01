'use strict';

var directives = angular.module('acromaster.directives');

directives.directive('debug', ['environment', function(environment) {
  return {
    restrict: 'E',
    link: function(scope, element) {
      if (!environment.isDebug()) {
        element.addClass('ng-hide');
      }
    }
  };
}]);