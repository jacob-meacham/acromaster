'use strict';

var FlowPlayController = function($scope, $location, $routeParams, flowService) {
  var flow = flowService.getCurrentFlow();
  if (!flow) {
    flow = flowService.instantiateFlow($routeParams.flowId);
  }

  $scope.flow = flow;
  
  $scope.onFlowEnd = function(err) {
    if (err) {
      $location.path('/');
    } else {
      $location.path('/flow/end');
    }
  };
};

angular.module('acromaster.controllers')
  .controller('FlowPlayController', ['$scope', '$location', '$routeParams', 'FlowService', FlowPlayController]);
