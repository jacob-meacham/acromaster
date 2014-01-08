'use strict';

var controllers = angular.module('acromaster.controllers', []);

// Quick Create
controllers.controller('QuickPlayCreateController', ['$scope', '$location', 'Flow', 'flowService', function($scope, $location, Flow, flowService) {
  var flowParams = $scope.flowParams = {totalMinutes: 30, difficulty: 3, timePerMove: 15, timeVariance: 10};

  $scope.start = function() {
    // Pass the flow we'd like to use on.
    flowParams.totalTime = flowParams.totalMinutes * 60;
    Flow.generate(flowParams, function(flow) {
      flowService.setFlow(flow);
      $location.path('/flow/quick/play');
    });
  };
}]);

controllers.controller('FlowPlayController', ['$scope', '$interval', '$location', '$routeParams', 'flowService', 'Flow', function($scope, $interval, $location, $routeParams, flowService, Flow) {
  // TODO: Smelly!
  var flow = flowService.getFlow();
  if (flow === null) {
    flow = Flow.get({flowId: $routeParams.flowId});
  }
  
  $scope.flow = flow;
  var currentEntry = {};
  $scope.currentMove = {};

  angular.forEach(flow.moves, function(entry) {
    entry.visible = false;
  });

  var nextMove = function(entryIndex) {
    if (currentEntry) {
      currentEntry.visible = false;
    }

    if (entryIndex >= flow.moves.length) {
      $location.path('/flow/quick');
    }
    
    currentEntry = flow.moves[entryIndex];
    currentEntry.visible = true;
    $scope.currentMove = currentEntry.move;

    $interval(function() {
      nextMove(entryIndex+1); }, currentEntry.duration * 1000, 1);
  };
  
  $scope.$on('$routeChangeSuccess', function () {
    nextMove(0);
  });
}]);

controllers.controller('FlowListController', ['$scope', 'Flow', function($scope, Flow) {
  var find = $scope.find = function(query) {
    var flowResponse = Flow.get(query, function() {
      $scope.flows = flowResponse.flows;
    });
  };

  find();
}]);

controllers.controller('FlowCreateController', ['$scope', '$location', 'Flow', 'Moves', function($scope, $location, Flow, Moves) {
  var allMoves = $scope.allMoves = Moves.query();
  console.log(allMoves);
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