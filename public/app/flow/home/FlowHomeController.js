'use strict';

var FlowHomeController = function($location, flash, Flow, PageHeaderService) {
  var vm = this;
  vm.flash = flash;

  var populateFlows = function() {
    Flow.get({random: true, max: 11}, function(response) {
      vm.randomFlow = response.flows[0];
      vm.featuredFlows = response.flows.slice(1, response.total);
    });
  };

  vm.retryPopulate = function() {
    vm.flash.error = false;
    populateFlows();
  };

  PageHeaderService.setTitle('Flows');
  populateFlows();
};

angular.module('acromaster.controllers')
  .controller('FlowHomeController', ['$location', 'flash', 'Flow', 'PageHeaderService', 'PageHeaderService', FlowHomeController]);
