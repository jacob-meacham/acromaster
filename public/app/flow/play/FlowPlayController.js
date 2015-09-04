'use strict';

var FlowPlayController = function($scope, $location, $routeParams, flowService, pageHeaderService, containerService) {
  var vm = this;
  var flow = flowService.getCurrentFlow();
  if (!flow) {
    flow = flowService.instantiateFlow($routeParams.flowId, function() {
      pageHeaderService.setTitle(flow.name);
    });
  } else {
    pageHeaderService.setTitle(flow.name);
  }

  containerService.setFluid(true);

  $scope.$on('$routeChangeStart', function() {
    containerService.setFluid(false);
  });

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
  .controller('FlowPlayController', ['$scope', '$location', '$routeParams', 'FlowService', 'PageHeaderService', 'ContainerService', FlowPlayController]);
