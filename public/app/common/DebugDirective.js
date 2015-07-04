'use strict';

var debug = function(environment) {
  return {
    restrict: 'E',
    transclude: true,
    template: '<div class="debug"><button class="btn btn-default" ng-click="toggleCollapse()">{{label}}</button><pre class="debug-inner" collapse="isCollapsed"><ng-transclude></ng-transclude></pre></div>',
    link: function(scope, element) {
      if (!environment.isDebug()) {
        element.addClass('ng-hide');
      }

      scope.isCollapsed = true;

      var setLabel = function() {
        if (scope.isCollapsed) {
          scope.label = 'Show Debug Info...';
        } else {
          scope.label = 'Hide Debug Info...';
        }
      };

      scope.toggleCollapse = function() {
        scope.isCollapsed = !scope.isCollapsed;
        setLabel();
      };

      setLabel();
    }
  };
};

angular.module('acromaster.directives')
  .directive('debug', ['environment', debug]);
