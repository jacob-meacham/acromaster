'use strict';

var backButton = function() {
  return {
    restrict: 'E',
    template: '<a ng-href="{{url}}"><span class="glyphicon glyphicon-circle-arrow-left"></span></a>',
    scope: {
      'url': '@'
    },
    link: function(scope, element) {
      element.addClass('back-button');
    }
  };
};

angular.module('acromaster.directives')
  .directive('backButton', backButton);
