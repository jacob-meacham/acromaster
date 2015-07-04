'use strict';

var FlowSearchResultsController = function(flowsPromise, pageHeaderService) {
  var vm = this;
  vm.flows = flowsPromise.flows;

  pageHeaderService.setTitle('Flow Search Results');
};

angular.module('acromaster.controllers')
  .controller('FlowSearchResultsController', ['flows', 'PageHeaderService', FlowSearchResultsController]);
