'use strict';

var directives = angular.module('acromaster.directives');

directives.controller('FlowShareDirectiveController', ['$location', function($location) {
  var vm = this;
  vm.baseUrl = $location.absUrl().replace($location.path(), '') + '/flow';
}]);
directives.directive('flowShare', ['$document', '$timeout', function($document, $timeout) {
  function link(scope, element) {
    // Sadly, nsPopover compiles async, and doesn't have any callback, so we fake it via a timeout
    var focusTimeout;
    var compileTimeout = $timeout(function() {
      // TODO: add popover to this element container
      var popover = $document.find('#nspopover-1');
      var input = popover.find('input');
      input.on('click', function() {
        input[0].select();
      });
      
      element.on('click', function() {
        focusTimeout = $timeout(function() {
          input[0].focus();
          input[0].select();
        }, 10);
      });
    }, 1000);

    element.on('$destroy', function() {
      $timeout.cancel(compileTimeout);
      if (angular.isDefined(focusTimeout)) {
        $timeout.cancel(focusTimeout);
      }
    });
  }

  return {
    restrict: 'E',
    link: link,
    template: '<a href="#" ns-popover ns-popover-template="partials/flow/share_popover.html" ns-popover-theme="ns-popover-tooltip-theme" ns-popover-placement="top">Share this flow</a>',
    controller: 'FlowShareDirectiveController',
    controllerAs: 'vm',
    bindToController: true,
    scope: {
      flowId: '@'
    }
  };
}]);