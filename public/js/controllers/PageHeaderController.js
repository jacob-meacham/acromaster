'use strict';

var PageHeaderController = function(HeadService) {
  var vm = this;
  // Not the nicest, but it makes working with this controller much easier (instead of adding a bunch of watches)
  vm.header = HeadService;
};

angular.module('acromaster.controllers')
  .controller('PageHeaderController', ['PageHeaderService', PageHeaderController]);