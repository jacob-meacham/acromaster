'use strict';

var WaschingMachineViewController = function($scope, WashingMachineService) {
  $scope.generate = function() {
    WashingMachineService.generate().then(function(washingMachine) {
      $scope.move1 = washingMachine.move1;
      $scope.move2 = washingMachine.move2;
      $scope.washing_machine = washingMachine.name;
    });
  };

  $scope.generate();
};

angular.module('acromaster.controllers')
  .controller('WashingMachineViewController', ['$scope', 'WashingMachineService', WaschingMachineViewController]);
