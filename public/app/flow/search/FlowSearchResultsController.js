'use strict';

var FlowSearchResultsController = function($location, $routeParams, $anchorScroll, rand, flash, flowsPromise, pageHeaderService) {
  var vm = this;
  if (flowsPromise.success === false || !flowsPromise.flows) {
    flash.error = 'There was an error processing your request. Please try again later.';
  } else if (flowsPromise.flows.length === 0) {
    flash.error = 'No flows matched your query.';
  }

  vm.flows = flowsPromise.flows;
  vm.searchQuery = $routeParams.search_query;

  vm.randomFlow = rand.choose(vm.flows);

  vm.search = function() {
    $location.path('/flows/results').search({search_query: vm.searchQuery});
  };

  vm.onPageChange = function() {
    $anchorScroll(); // Scroll back to the top.
  };

  pageHeaderService.setTitle('Flow Search Results');
};

angular.module('acromaster.controllers')
  .controller('FlowSearchResultsController', ['$location', '$routeParams', '$anchorScroll', 'RandomService', 'flash', 'flows', 'PageHeaderService', FlowSearchResultsController]);
