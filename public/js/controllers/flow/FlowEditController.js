'use strict';

var FlowEditController = function($scope, $routeParams, $location, flowService) {
  flowService.instantiateFlow($routeParams.flowId, function(flow) {
    // Done this way to let the directive watch the top-level variable.
    $scope.flow = flow;
  });

  $scope.saveSuccess = function(savedFlow) {
    $location.path('/flow/' + savedFlow.id);
  };
};

angular.module('acromaster.controllers')
  .controller('FlowEditController', ['$scope', '$routeParams', '$location', 'FlowService', FlowEditController]);
