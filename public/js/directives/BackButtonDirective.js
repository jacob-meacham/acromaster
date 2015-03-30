'use strict';

var directives = angular.module('acromaster.directives');

directives.directive('backButton', [function() {
  return {
    restrict: 'E',
    template: '<a ng-href="{{url}}"><span class="glyphicon glyphicon-circle-arrow-left large-glyphicon back-button"></span></a>',
    scope: {
      'url': '@'
    }
  };
}]);