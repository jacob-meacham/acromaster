'use strict';

var controllers = angular.module('acromaster.controllers');

controllers.controller('FlowPlayController', ['$scope', '$interval', '$location', '$routeParams', 'flowService', 'Flow', function($scope, $interval, $location, $routeParams, flowService, Flow) {
  // TODO: Possibly more of this should be in the directive
  var flow = flowService.getCurrentFlow();
  
  $scope.flow = flow;
  var currentEntry = {};
  $scope.currentMove = {};

  $scope.hasStarted = false;
  $scope.start = function() {
    $scope.hasStarted = true;
    if (flow === null) {
      Flow.get({flowId: $routeParams.flowId}, function(returnedFlow) {
        $scope.flow = flow = returnedFlow;
        flowService.setCurrentFlow(flow);

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

controllers.controller('FlowEndController', ['$scope', '$location', 'flowService', '$timeout', '_', function($scope, $location, flowService, $timeout, _) {
  var flow = flowService.getCurrentFlow();
/*  if (flow === null) {
    var moves = [];
    for (var j = 0; j < 80; j++) {
      moves.push({duration: 50, move: {difficulty: j % 15}});
    }

    flow = {
      moves: moves
    };
  }*/
  console.log(flow);
  
  if (flow === null || flow.moves.length === 0) {
    // No flow defined, so redirect back to home.
    $location.path('/');
  }

  var totalTime = 0;
  var difficulty = 0;
  for (var i = 0; i < flow.moves.length; i++) {
    totalTime += flow.moves[i].duration;
    difficulty += flow.moves[i].move.difficulty;
  }

  totalTime /= 60;
  difficulty /= flow.moves.length;

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

  $scope.$on('$routeChangeSuccess', function () {
    $timeout(function() {
      $scope.numMovesOptions.value = flow.moves.length;
    }, 650);

    $timeout(function() {
      $scope.totalTimeOptions.value = totalTime;
    }, 850);

    $timeout(function() {
      $scope.difficultyOptions.value = difficulty;
    }, 1050);
  });
}]);