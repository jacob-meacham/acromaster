'use strict';

var controllers = angular.module('acromaster.controllers');

controllers.controller('FlowPlayController', ['$scope', '$interval', '$location', '$routeParams', 'flowService', 'Flow', function($scope, $interval, $location, $routeParams, flowService, Flow) {
  var flow = flowService.getCurrentFlow();
  if (flow === null) {
    flow = Flow.get({flowId: $routeParams.flowId});
    flowService.setCurrentFlow(flow);
  }
  
  $scope.flow = flow;
  var currentEntry = {};
  $scope.currentMove = {};

  angular.forEach(flow.moves, function(entry) {
    entry.visible = false;
  });

  var intervalPromise;
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

    intervalPromise = $interval(function() {
      nextMove(entryIndex+1); }, currentEntry.duration * 1000, 1);
  };
  
  $scope.$on('$routeChangeSuccess', function () {
    console.log(flow);
    nextMove(0);
  });

  $scope.$on('$destroy', function() {
    if (angular.isDefined(intervalPromise)) {
      $interval.cancel(intervalPromise);
      intervalPromise = undefined;
    }
  });
}]);

controllers.controller('FlowEndController', ['$scope', '$location', 'flowService', function($scope, $location, flowService) {
  var flow = flowService.getCurrentFlow();
  if (flow === null) {
    flow = {
      moves: [{duration: 10, difficulty: 10}, {duration: 5, difficulty: 5}, {duration: 10, difficulty: 10}, {duration: 5, difficulty: 5}, {duration: 10, difficulty: 10}, {duration: 5, difficulty: 5}]
    };
  }
  
  if (flow === null || flow.moves.length === 0) {
    // No flow defined, so redirect back to home.
    $location.path('/');
  }

  var totalTime = 0;
  var difficulty = 0;
  for (var i = 0; i < flow.moves.length; i++) {
    totalTime += flow.moves[i].duration;
    difficulty += flow.moves[i].difficulty;
  }

  difficulty /= flow.moves.length;
  
  $scope.totalTime = [totalTime];
  $scope.difficulty = [difficulty];
  $scope.numMoves = [flow.moves.length];

  $scope.labels = {
    numMoves: ['Number of Moves'],
    totalTime: ['Total Time'],
    difficulty: ['Average Move Difficulty']
  };

  $scope.colors = {
    numMoves:
      [{ // blue
        fillColor: 'rgba(151,187,205,0.2)',
        strokeColor: 'rgba(151,187,205,1)',
        pointColor: 'rgba(151,187,205,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(151,187,205,0.8)'
      }],
    totalTime:
      [{ // red
        fillColor: 'rgba(247,70,74,0.2)',
        strokeColor: 'rgba(247,70,74,1)',
        pointColor: 'rgba(247,70,74,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(247,70,74,0.8)'
      }],
    difficulty:
      [{ // green
        fillColor: 'rgba(70,191,189,0.2)',
        strokeColor: 'rgba(70,191,189,1)',
        pointColor: 'rgba(70,191,189,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(70,191,189,0.8)'
      }]
  };

  $scope.chartOptions = {
    animationSteps : 30,
    animationEasing : 'none',
    animateRotate : true,
  };
}]);