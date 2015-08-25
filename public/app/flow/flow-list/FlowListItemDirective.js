'use strict';

var FlowListItemDirectiveController = function() {
  var vm = this;

  // TODO: Move to a service?
  vm.getDifficultyDescription = function(difficulty) {
    if (difficulty <= 3) {
      return 'Beginner';
    } else if (difficulty <= 6) {
      return 'Intermediate';
    } else if (difficulty <= 9) {
      return 'Hard';
    } else {
      return 'Expert';
    }
  };

  vm.getPaceDescription = function(pace) {
    if (pace <= 5) {
      return 'Mercurial';
    } else if (pace <= 12) {
      return 'Quick';
    } else if (pace <= 20) {
      return 'Moderate';
    } else if (pace <= 30) {
      return 'Slow';
    } else {
      return 'Marathon';
    }
  };
  
};

var FlowListItem = function() {
  return {
    restrict: 'E',
    scope: {
      flow: '=',
    },
    templateUrl: 'app/flow/flow-list/flow-list-item.html',
    controller: 'FlowListItemDirectiveController',
    controllerAs: 'vm',
  };
};

angular.module('acromaster.directives')
  .controller('FlowListItemDirectiveController', [FlowListItemDirectiveController])
  .directive('flowListItem', FlowListItem);
