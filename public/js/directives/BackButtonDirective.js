'use strict';

var backButton = function() {
  return {
    restrict: 'E',
    template: '<a ng-href="{{url}}"><span class="glyphicon glyphicon-circle-arrow-left large-glyphicon back-button"></span></a>',
    scope: {
      'url': '@'
    }
  };
};

angular.module('acromaster.directives')
  .directive('backButton', backButton);
