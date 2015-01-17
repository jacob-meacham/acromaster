'use strict';

angular.module('acromaster.controllers').controller('QuickPlayCreateController', ['$scope', '$location', 'Flow', 'flowService', function($scope, $location, Flow, flowService) {
  var flowParams = $scope.flowParams = {totalMinutes: 30, difficulty: 3, timePerMove: 15, timeVariance: 10};

  $scope.start = function() {
    flowParams.totalTime = flowParams.totalMinutes * 60;
    Flow.generate(flowParams, function(newFlow) {
      flowService.setCurrentFlow(newFlow);
      $location.path('/flow/quick/play');
    });
  };
}]);