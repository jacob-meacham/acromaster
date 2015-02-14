'use strict';

var controllers = angular.module('acromaster.controllers');

controllers.controller('FlowListController', ['$scope', 'Flow', function($scope, Flow) {
  var find = $scope.find = function(query) {
    var flowResponse = Flow.get(query, function() {
      $scope.flows = flowResponse.flows;
    });
  };

  find();
}]);

controllers.controller('FlowCreateController', ['$scope', '$location', 'Flow', function($scope, $location, Flow) {
  $scope.flow = new Flow({moves: []});
  
  $scope.saveSuccess = function(savedFlow) {
    $location.path('/flow/' + savedFlow._id);
  };
}]);

controllers.controller('FlowEditController', ['$scope', '$routeParams', '$location', 'FlowService', function($scope, $routeParams, $location, FlowService) {
  $scope.flow = FlowService.instantiateFlow($routeParams.flowId);

  $scope.saveSuccess = function(savedFlow) {
    $location.path('/flow/' + savedFlow._id);
  };
}]);

controllers.controller('FlowViewController', ['$scope', '$routeParams', '$location', 'FlowService', function($scope, $routeParams, $location, FlowService) {
  var flow = $scope.flow = FlowService.instantiateFlow($routeParams.flowId);

  $scope.start = function() {
    $location.path('/flow/' + flow._id + '/play');
  };
}]);