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

controllers.controller('FlowCreateController', ['$scope', 'Flow', 'Moves', function($scope, Flow, Moves) {
  var allMoves = Moves.query();
  $scope.create = function() {
    var movesList = [{
      move: allMoves[0]._id,
      duration: 20
    },
    {
      move: allMoves[1]._id,
      duration: 30
    },
    {
      move: allMoves[2]._id,
      duration: 40
    }];

    var newFlow = new Flow({name: 'Test', author: 'Test Author', moves: movesList});
    newFlow.$save();
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