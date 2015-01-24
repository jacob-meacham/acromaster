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

  $scope.moveList = [];

  // TODO: Refactor into directive.
  $scope.addMove = function() {
    $scope.inserted = {
      move: null,
      duration: 20
    };
    
    $scope.moveList.push($scope.inserted);
  };

  $scope.updateMove = function($index, $data) {
    $scope.moveList[$index].move = $data;
  };

  $scope.removeMove = function(index) {
    $scope.moveList.splice(index, 1);
  };

  $scope.create = function() {
    flow.moves = [];
    for (var i = 0; i < $scope.moveList.length; i++) {
      flow.moves.push({
        move: $scope.moveList[i].move._id,
        duration: $scope.moveList[i].duration
      });
    }

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