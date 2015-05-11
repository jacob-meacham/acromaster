'use strict';

angular.module('acromaster.controllers').controller('WorkoutCreateController', ['$scope', '$location', 'FlowService', 'RandomNameService', function($scope, $location, FlowService, RandomNameService) {
  var flowParams = $scope.flowParams = {totalMinutes: 30, difficulty: 3, timePerMove: 15, timeVariance: 10};

  $scope.generateFlow = function() {
    flowParams.totalTime = flowParams.totalMinutes * 60;
    flowParams.flowName = RandomNameService.generateFlowName();
    FlowService.generateFlow(flowParams).then(function(flow) {
      $location.path('/flow/' + flow.id + '/play');
    });
  };
}]);