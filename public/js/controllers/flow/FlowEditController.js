'use strict';

var FlowEditController = function($routeParams, $location, flowService, pageHeaderService) {
  var vm = this;
  var flow = flowService.instantiateFlow($routeParams.flowId, function(flow) {
    // Done this way to let the directive watch the top-level variable.
    vm.flow = flow;
    pageHeaderService.setTitle('Edit Flow - ' + flow.name);
  });

  pageHeaderService.setTitle('Edit Flow - ' + flow.name);

  vm.saveSuccess = function(savedFlow) {
    $location.path('/flow/' + savedFlow.id);
  };
};

angular.module('acromaster.controllers')
  .controller('FlowEditController', ['$routeParams', '$location', 'FlowService', 'PageHeaderService', FlowEditController]);
