'use strict';

var directives = angular.module('acromaster.directives');

directives.controller('FlowShareDirectiveController', ['$location', function($location) {
  var vm = this;
  vm.baseUrl = $location.absUrl() + '/flow';
}]);
directives.directive('flowShare', [function() {
  return {
    restrict: 'E',
    template: '<a href="#" ns-popover ns-popover-template="partials/flow/flowpopover.html" ns-popover-theme="ns-popover-tooltip-theme">Share this flow</a>',
    controller: 'FlowShareDirectiveController',
    controllerAs: 'vm',
    bindToController: true,
    scope: {
      flowId: '@'
    }
  };
}]);