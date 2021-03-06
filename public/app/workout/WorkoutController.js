'use strict';

var QuickPlayController = function($location, $scope, $modal, flash, flowService, rand, pageHeaderService) {
  var vm = this;
  var flowParams = vm.flowParams = {totalMinutes: 30, difficulty: 3, timePerMove: 15, timeVariance: 10};
  vm.currentDifficultyIndex = 1;
  vm.currentMoveLengthIndex = 2;
  vm.moveDurationExplanation = 'Allows you to fine-tune the base time per pose.';
  vm.moveVarianceExplanation = 'This is the random number of seconds added to each pose in the workout.';
  vm.difficultyExplanation = 'Poses that have a higher difficulty than this won\'t be part of the workout.';

  vm.collapseAdvancedPane = true;
  vm.toggleAdvancedPane = function() {
    vm.collapseAdvancedPane = !vm.collapseAdvancedPane;
  };

  pageHeaderService.setTitle('Flow Play');

  vm.generateFlow = function() {
    vm.generating = true;
    flowParams.totalTime = flowParams.totalMinutes * 60;
    flowParams.flowName = rand.generateFlowName();
    flowParams.imageUrl = rand.randomFlowIcon();
    flowService.generateFlow(flowParams).then(function(flow) {
      $location.path('/flow/' + flow.id + '/play');
    }).catch(function() {
      vm.generating = false;
      vm.error = true;
    });
  };

  vm.openExplanationModal = function(explanation) {
    $modal.open({
      template: '<div class="flow-variable-explanation">' + explanation + '</div>',
      size: 'sm',
      backdrop: true
    });
  };

  vm.hideError = function() {
    flash.error = false;
    vm.error = false;
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
  .controller('QuickPlayController', ['$location', '$scope', '$modal', 'flash', 'FlowService', 'RandomNameService', 'PageHeaderService', QuickPlayController]);
