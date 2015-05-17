'use strict';

var FlowCreateController = function($scope, $routeParams, $location, Flow, flowService) {
  $scope.flow = new Flow({moves: []});
  if ($routeParams.flowId) {
    flowService.instantiateFlow($routeParams.flowId, function(flow) {
      $scope.flow = new Flow({moves: []}); // Force the value to change
      $scope.flow.moves = flow.moves;
      $scope.flow.name = 'Remix of ' + flow.name;
    });
  }
  
  $scope.saveSuccess = function(savedFlow) {
    $location.path('/flow/' + savedFlow.id);
  };
};

var controllers = angular.module('acromaster.controllers');
controllers.controller('FlowCreateController', ['$scope', '$routeParams', '$location', 'Flow', 'FlowService', FlowCreateController]);
