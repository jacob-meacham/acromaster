'use strict';

var FlowHomeController = function($location, Flow, PageHeaderService) {
  var vm = this;
  Flow.get({random: true, max: 11}, function(response) {
    vm.randomFlow = response.flows[0];
    vm.featuredFlows = response.flows.slice(1, response.total);
  });

  PageHeaderService.setTitle('Acromaster - Flows');

  vm.search = function() {
    $location.path('/flows/results').search({search_query: vm.searchQuery});
  };
};

angular.module('acromaster.controllers')
  .controller('FlowHomeController', ['$location', 'Flow', 'PageHeaderService', FlowHomeController]);
