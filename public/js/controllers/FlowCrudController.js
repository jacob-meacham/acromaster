'use strict';

var controllers = angular.module('acromaster.controllers');

controllers.controller('FlowHomeController', ['$scope', '$location', 'Flow', function($scope, $location, Flow) {
  Flow.get({random: true, max: 11}).success(function(response) {
    $scope.randomFlow = response.flows[0];
    $scope.featuredList = response.flows.slice(1, response.count-1);
  });

  $scope.find = function(query) {
    $location.path('/flows/results?search_query=' + query);
  };
}]);

controllers.controller('FlowSearchResultsController', ['$scope', 'flows', function($scope, flows) {
  $scope.flows = flows;
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