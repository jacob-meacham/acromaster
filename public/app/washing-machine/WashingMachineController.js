'use strict';

var WaschingMachineViewController = function(WashingMachineService, pageHeaderService) {
  var vm = this;

  pageHeaderService.setTitle('Washing Machines');
  
  vm.generate = function() {
    WashingMachineService.generate().then(function(washingMachine) {
      vm.move1 = washingMachine.move1;
      vm.move2 = washingMachine.move2;
      vm.washing_machine = washingMachine.name;
    });
  };

  vm.generate();
};

angular.module('acromaster.controllers')
  .controller('WashingMachineViewController', ['WashingMachineService', 'PageHeaderService', WaschingMachineViewController]);
