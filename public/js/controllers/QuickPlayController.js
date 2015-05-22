'use strict';

var WorkoutCreateController = function($location, FlowService, RandomNameService, pageHeaderService) {
  var vm = this;
  var flowParams = vm.flowParams = {totalMinutes: 30, difficulty: 3, timePerMove: 15, timeVariance: 10};

  pageHeaderService.setTitle('Flow Play');

  vm.generateFlow = function() {
    flowParams.totalTime = flowParams.totalMinutes * 60;
    flowParams.flowName = RandomNameService.generateFlowName();
    FlowService.generateFlow(flowParams).then(function(flow) {
      $location.path('/flow/' + flow.id + '/play');
    });
  };
};

angular.module('acromaster.controllers')
  .controller('WorkoutCreateController', ['$location', 'FlowService', 'RandomNameService', 'PageHeaderService', WorkoutCreateController]);
