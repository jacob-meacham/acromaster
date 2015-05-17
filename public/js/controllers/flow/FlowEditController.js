'use strict';

var FlowEditController = function($routeParams, $location, flowService) {
  var vm = this;
  flowService.instantiateFlow($routeParams.flowId, function(flow) {
    // Done this way to let the directive watch the top-level variable.
    vm.flow = flow;
  });

  vm.saveSuccess = function(savedFlow) {
    $location.path('/flow/' + savedFlow.id);
  };
};

angular.module('acromaster.controllers')
  .controller('FlowEditController', ['$routeParams', '$location', 'FlowService', FlowEditController]);
