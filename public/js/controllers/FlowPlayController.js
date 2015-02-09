'use strict';

var controllers = angular.module('acromaster.controllers');

controllers.controller('FlowPlayController', ['$scope', '$location', '$routeParams', 'FlowService', function($scope, $location, $routeParams, flowService) {
  var flow = flowService.getCurrentFlow();
  if (!flow) {
    flow = flowService.instantiateFlow($routeParams.flowId);
  }

  $scope.flow = flow;
  
  $scope.onFlowEnd = function(err) {
    if (err) {
      $location.path('/');
    } else {
      $location.path('/flow/end');
    }
  };
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