'use strict';

var WaschingMachineViewController = function($routeParams, WashingMachineService, pageHeaderService) {
  var vm = this;

  pageHeaderService.setTitle('Washing Machines');
  
  vm.generate = function() {
    WashingMachineService.generate().then(function(washingMachine) {
      vm.move1 = washingMachine.move1.name;
      vm.move2 = washingMachine.move2.name;
      vm.washing_machine = washingMachine.name;

      // TODO: Make coords more concise?
      vm.coords = [washingMachine.move1.name, washingMachine.move2.name, washingMachine.name].join(',');
    });
  };

  var needGeneration = true;
  if ($routeParams.coords) {
    try {
      needGeneration = false;
      
      vm.coords = $routeParams.coords;
      var coords = vm.coords.split(',');
      vm.move1 = coords[0];
      vm.move2 = coords[1];
      vm.washing_machine = coords[2];
    } catch (err) {
      needGeneration = true;
    }
  }

  if (needGeneration) {
    vm.generate();
  }
};

angular.module('acromaster.controllers')
  .controller('WashingMachineViewController', ['$routeParams', 'WashingMachineService', 'PageHeaderService', WaschingMachineViewController]);
