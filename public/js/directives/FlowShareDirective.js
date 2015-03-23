'use strict';

var directives = angular.module('acromaster.directives');

directives.directive('flowShare', [function() {
  return {
    restrict: 'E',
    template: '<a href="#" popover="Popover {{flowId}}">Share this flow</a>',
    scope: {
      'flowId': '@'
    }
  };
}]);