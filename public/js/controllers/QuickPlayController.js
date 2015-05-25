'use strict';

var WorkoutCreateController = function($location, $scope, FlowService, RandomNameService, pageHeaderService) {
  var vm = this;
  var flowParams = vm.flowParams = {totalMinutes: 30, difficulty: 3, timePerMove: 15, timeVariance: 10};
  vm.currentDifficultyIndex = 1;
  vm.currentMoveLengthIndex = 2;
  vm.collapseAdvancedPane = true;
  vm.toggleAdvancedPane = function() {
    vm.collapseAdvancedPane = !vm.collapseAdvancedPane;
  };

  pageHeaderService.setTitle('Flow Play');

  vm.generateFlow = function() {
    flowParams.totalTime = flowParams.totalMinutes * 60;
    flowParams.flowName = RandomNameService.generateFlowName();
    FlowService.generateFlow(flowParams).then(function(flow) {
      $location.path('/flow/' + flow.id + '/play');
    });
  };

  $scope.$watch('vm.currentDifficultyIndex', function(newVal) {
    if (newVal === 0) { // Beginner
      flowParams.difficulty = 3;
    } else if (newVal === 1) { // Intermediate
      flowParams.difficulty = 5;
    } else if (newVal === 2) { // Hard
      flowParams.difficulty = 7;
    } else { // Expert/Hackerzzzz
      flowParams.difficulty = 11;
    }
  });

  $scope.$watch('vm.currentMoveLengthIndex', function(newVal) {
    if (newVal === 0) { // Quick
      flowParams.timePerMove = 8;
      flowParams.timeVariance = 0;
    } else if (newVal === 1) { // Short
      flowParams.timePerMove = 10;
      flowParams.timeVariance = 5;
    } else if (newVal === 2) { // Medium
      flowParams.timePerMove = 15;
      flowParams.timeVariance = 10;
    } else if (newVal === 3) { // Long
      flowParams.timePerMove = 25;
      flowParams.timeVariance = 10;
    } else { // Epic/Hackerzzzz
      flowParams.timePerMove = 35;
      flowParams.timeVariance = 30;
    }
  });
};

angular.module('acromaster.controllers')
  .controller('WorkoutCreateController', ['$location', '$scope', 'FlowService', 'RandomNameService', 'PageHeaderService', WorkoutCreateController]);
