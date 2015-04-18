'use strict';

var controllers = angular.module('acromaster.controllers');

controllers.controller('FlowHomeController', ['$scope', '$location', 'Flow', function($scope, $location, Flow) {
  Flow.get({random: true, max: 11}, function(response) {
    console.log(response.total);
    $scope.randomFlow = response.flows[0];
    $scope.featuredFlows = response.flows.slice(1, response.total-1);
    console.log($scope.featuredFlows);
  });

  $scope.find = function(query) {
    $location.path('/flows/results?search_query=' + query);
  };
}]);

controllers.controller('FlowSearchResultsController', ['$scope', 'flows', function($scope, flowsPromise) {
  console.log(flowsPromise);
  $scope.flows = flowsPromise.flows;
}]);

controllers.controller('FlowCreateController', ['$scope', '$location', 'Flow', function($scope, $location, Flow) {
  $scope.flow = new Flow({moves: []});
  
  $scope.saveSuccess = function(savedFlow) {
    $location.path('/flow/' + savedFlow.id);
  };
}]);

controllers.controller('FlowEditController', ['$scope', '$routeParams', '$location', 'FlowService', function($scope, $routeParams, $location, FlowService) {
  $scope.flow = FlowService.instantiateFlow($routeParams.flowId);

  $scope.saveSuccess = function(savedFlow) {
    $location.path('/flow/' + savedFlow.id);
  };
}]);

controllers.controller('FlowViewController', ['$scope', '$routeParams', '$location', 'FlowService', function($scope, $routeParams, $location, FlowService) {
  var flow = $scope.flow = FlowService.instantiateFlow($routeParams.flowId);

  $scope.url = $location.absUrl - $location.path + '/flow';

  $scope.start = function() {
    $location.path('/flow/' + flow.id + '/play');
  };
}]);