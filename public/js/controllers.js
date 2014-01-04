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

controllers.controller('FlowPlayController', ['$scope', '$interval', '$location', 'flowService', function($scope, $interval, $location, flowService) {
  var flow = $scope.flow = flowService.getFlow();
  var currentEntry = {};
  $scope.currentMove = {};

  angular.forEach(flow.flowEntries, function(entry) {
    entry.visible = false;
  });

  var nextMove = function(entryIndex) {
    if (currentEntry) {
      currentEntry.visible = false;
    }

    if (entryIndex >= flow.flowEntries.length) {
      $location.path('/flow/quick');
    }
    
    currentEntry = flow.flowEntries[entryIndex];
    currentEntry.visible = true;
    $scope.currentMove = currentEntry.move;

    $interval(function() {
      nextMove(entryIndex+1); }, currentEntry.time * 1000, 1);
  };
  
  nextMove(0);
}]);