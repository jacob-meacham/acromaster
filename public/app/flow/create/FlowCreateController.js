'use strict';

var FlowCreateController = function($routeParams, $location, rand, Flow, flowService, pageHeaderService) {
  var vm = this;

  if ($routeParams.flowId) {
    flowService.instantiateFlow($routeParams.flowId, function(flow) {
      vm.flow = flow;
      vm.flow.name = 'Remix of ' + flow.name;
    });
  } else {
    vm.flow = new Flow({moves: []});
    vm.flow.imageUrl = rand.randomFlowIcon();
  }

  pageHeaderService.setTitle('Create Flow');
  
  vm.saveSuccess = function(savedFlow) {
    $location.path('/flow/' + savedFlow.id);
  };
};

angular.module('acromaster.controllers')
  .controller('FlowCreateController', ['$routeParams', '$location', 'RandomNameService', 'Flow', 'FlowService', 'PageHeaderService', FlowCreateController]);
