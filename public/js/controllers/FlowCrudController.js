'use strict';

var controllers = angular.module('acromaster.controllers');

controllers.controller('FlowHomeController', ['$scope', '$location', 'Flow', function($scope, $location, Flow) {
  Flow.get({random: true, max: 11}, function(response) {
    console.log(response);
    $scope.randomFlow = response.flows[0];
    $scope.featuredFlows = response.flows.slice(1, response.total);
  });

  $scope.find = function(query) {
    $location.path('/flows/results?search_query=' + query);
  };
}]);

controllers.controller('FlowSearchResultsController', ['$scope', 'flows', function($scope, flowsPromise) {
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

controllers.controller('FlowViewController', ['$scope', '$routeParams', '$location', 'FlowService', 'AuthService', function($scope, $routeParams, $location, flowService, authService) {
  var flow = $scope.flow = flowService.instantiateFlow($routeParams.flowId, function() {
    $scope.canEdit = authService.canEdit(flow);
  });

  $scope.start = function() {
    $location.path('/flow/' + flow.id + '/play');
  };

  $scope.delete = function() {
    // TODO: Popup first
    flow.$delete();
    $location.path('/flows/');
  };
}]);