'use strict';

var ContainerController = function(ContainerService) {
  var vm = this;

  // Not the nicest, but it makes working with this controller much easier (instead of adding a bunch of watches)
  vm.container = ContainerService;
};

angular.module('acromaster.controllers')
  .controller('ContainerController', ['ContainerService', ContainerController]);