'use strict';

var FlowListItem = function() {
  return {
    restrict: 'E',
    scope: {
      flow: '=',
    },
    templateUrl: 'app/flow/flow-list/flow-list-item.html'
  };
};

angular.module('acromaster.directives')
  .directive('flowListItem', FlowListItem);
