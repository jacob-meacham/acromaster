'use strict';

var FlowPlayController = function($location, $routeParams, flowService, pageHeaderService) {
  var vm = this;
  var flow = flowService.getCurrentFlow();
  if (!flow) {
    flow = flowService.instantiateFlow($routeParams.flowId, function() {
      pageHeaderService.setTitle(flow.name);
    });
  } else {
    pageHeaderService.setTitle(flow.name);
  }

  vm.flow = flow;

  vm.onFlowEnd = function(err) {
    if (err) {
      $location.path('/');
    } else {
      $location.path('/flow/end');
    }
  };
};

angular.module('acromaster.controllers')
  .controller('FlowPlayController', ['$location', '$routeParams', 'FlowService', 'PageHeaderService', FlowPlayController]);
