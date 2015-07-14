'use strict';

var FlowCreateController = function($routeParams, $location, Flow, flowService, pageHeaderService) {
  var vm = this;

  vm.flow = new Flow({moves: []});
  if ($routeParams.flowId) {
    flowService.instantiateFlow($routeParams.flowId, function(flow) {
      vm.flow = new Flow({moves: []}); // Force the value to change
      vm.flow.moves = flow.moves;
      vm.flow.name = 'Remix of ' + flow.name;
    });
  }

  pageHeaderService.setTitle('Create Flow');
  
  vm.saveSuccess = function(savedFlow) {
    $location.path('/flow/' + savedFlow.id);
  };
};

angular.module('acromaster.controllers')
  .controller('FlowCreateController', ['$routeParams', '$location', 'Flow', 'FlowService', 'PageHeaderService', FlowCreateController]);