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
    nextMove(0);
  });

  $scope.$on('$destroy', function() {
    if (angular.isDefined(intervalPromise)) {
      $interval.cancel(intervalPromise);
      intervalPromise = undefined;
    }
  });
}]);

controllers.controller('FlowEndController', ['$scope', '$location', 'flowService', '$timeout', '_', function($scope, $location, flowService, $timeout, _) {
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

  var commonOptions = {
    value: 0,
    gaugeWidthScale: 0.75,
    donut: true,
    relativeGaugeSize: true
  };
  
  $scope.totalTimeOptions = _.merge({
    title: 'Total Time',
    min: 0,
    max: 60,
    levelColors: ['#00FF00'],
    
  }, commonOptions);

  $scope.difficultyOptions = _.merge({
    title: 'Average Move Difficulty',
    min: 0,
    max: 9,
    levelColors: ['#FFFF00'],
  }, commonOptions);

  $scope.numMovesOptions = _.merge({
    title: 'Number of Moves',
    min: 0,
    max: 90,
    levelColors: ['#CE1B21'],
  }, commonOptions);

  $scope.$on('$routeChangeSuccess', function () {
    $timeout(function() {
      $scope.numMovesOptions.value = flow.moves.length;
      $scope.totalTimeOptions.value = totalTime;
      $scope.difficultyOptions.value = difficulty;
    }, 650);
  });
}]);