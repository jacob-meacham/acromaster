'use strict';

angular.module('acromaster.controllers').controller('WorkoutCreateController', ['$scope', '$location', 'FlowService', function($scope, $location, FlowService) {
  var flowParams = $scope.flowParams = {totalMinutes: 30, difficulty: 3, timePerMove: 15, timeVariance: 10};

  $scope.generateFlow = function() {
    flowParams.totalTime = flowParams.totalMinutes * 60;
    FlowService.generateFlow(flowParams, function() {
      $location.path('/flow/workout/play');
    });
  };
}]);