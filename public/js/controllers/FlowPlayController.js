'use strict';

var controllers = angular.module('acromaster.controllers');

controllers.controller('FlowPlayController', ['$scope', '$interval', '$location', '$routeParams', 'FlowService', function($scope, $interval, $location, $routeParams, FlowService) {
  // TODO: Possibly more of this should be in the directive
  var flow = FlowService.getCurrentFlow();
  
  $scope.flow = flow;
  var currentEntry = {};
  $scope.currentMove = {};

  $scope.hasStarted = false;
  $scope.start = function() {
    $scope.hasStarted = true;
    if (flow === null) {
      FlowService.instantiateFlow($routeParams.flowId, function() {
        $scope.flow = flow = FlowService.getCurrentFlow();

        angular.forEach(flow.moves, function(entry) {
          entry.visible = false;
        });

        nextMove(0);
      });
    } else {
      angular.forEach(flow.moves, function(entry) {
        entry.visible = false;
      });

      nextMove(0);
    }
  };

  var intervalPromise;
  var nextMove = function(entryIndex) {
    if (currentEntry) {
      currentEntry.visible = false;
    }

    if (entryIndex >= flow.moves.length) {
      $location.path('/flow/end');
    }
    
    currentEntry = flow.moves[entryIndex];
    currentEntry.visible = true;
    $scope.currentMove = currentEntry.move;
    $scope.$broadcast('flow-set', currentEntry.move.audioUri);

    intervalPromise = $interval(function() {
      nextMove(entryIndex+1); }, currentEntry.duration * 1000, 1);
  };

  $scope.$on('$destroy', function() {
    if (angular.isDefined(intervalPromise)) {
      $interval.cancel(intervalPromise);
      intervalPromise = undefined;
    }
  });
}]);

controllers.controller('FlowEndController', ['$scope', '$location', 'FlowService', 'FlowStatsService', '$timeout', '_', function($scope, $location, flowService, flowStats, $timeout, _) {
  var flow = flowService.getCurrentFlow();
  if (!flow || !flow.moves || flow.moves.length === 0) {
    // No flow defined, so redirect back to home.
    $location.path('/');
  }

  var stats = flowStats.getStats(flow);

  var commonOptions = {
    value: 0,
    gaugeWidthScale: 0.2,
    donut: true,
    relativeGaugeSize: true,
    valueFontColor: '#fff',
    titleFontColor: '#fff',
    gaugeColor: '#00000000',
    counter: true,
    donutStartAngle: 270
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
    max: 100,
    levelColors: ['#CE1B21'],
  }, commonOptions);

  $timeout(function() {
    $scope.numMovesOptions.value = stats.numMoves;
  }, 650);

  $timeout(function() {
    $scope.totalTimeOptions.value = stats.totalTime;
  }, 850);

  $timeout(function() {
    $scope.difficultyOptions.value = stats.difficulty;
  }, 1050);
}]);