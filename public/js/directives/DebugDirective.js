'use strict';

var debug = function(environment) {
  return {
    restrict: 'E',
    link: function(scope, element) {
      if (!environment.isDebug()) {
        element.addClass('ng-hide');
      }
    }
  };
};

angular.module('acromaster.directives')
  .directive('debug', ['environment', debug]);
