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

controllers.controller('FlowCreateController', ['$scope', '$location', 'Flow', 'Moves', function($scope, $location, Flow, Moves) {
  $scope.allMoves = Moves.query();
  var flow = $scope.flow = new Flow({moves: []});
  $scope.currentMove = null;
  $scope.currentDuration = 20;

  // TODO: Need a much better way to do this.
  $scope.moveList = [];

  // TODO: Refactor into directive.
  $scope.addMove = function() {
    flow.moves.push({
      move: $scope.currentMove._id,
      duration: $scope.currentDuration
    });

    // Currently need to keep two lists so that the flow only keeps the
    // move id.
    $scope.moveList.push({
      move: $scope.currentMove,
      duration: $scope.currentDuration
    });
    
    $scope.currentMove = null;
    $scope.currentDuration = 20;
  };

  $scope.create = function() {
    flow.$save(function(savedFlow) {
      $location.path('/flow/' + savedFlow._id);
    });
  };
}]);

controllers.controller('FlowEditController', ['$scope', '$routeParams', 'Flow', function($scope, $routeParams, Flow) {
  var flow = $scope.flow = Flow.get({flowId: $routeParams.flowId});
  flow.$update();
}]);

controllers.controller('FlowViewController', ['$scope', '$routeParams', '$location', 'Flow', 'flowService', function($scope, $routeParams, $location, Flow, flowService) {
  var flow = $scope.flow = Flow.get({flowId: $routeParams.flowId});

  $scope.start = function() {
    // Pass the flow we'd like to use on.
    flowService.setFlow(flow);
    $location.path('/flow/' + flow._id + '/play');
  };
}]);