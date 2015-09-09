'use strict';

var FlowSearchResultsController = function(flash, flowsPromise, pageHeaderService) {
  var vm = this;
  if (flowsPromise.success === false) {
    flash.error = 'There was an error processing your request. Please try again later.';
  }
  vm.flows = flowsPromise.flows;

  pageHeaderService.setTitle('Flow Search Results');
};

angular.module('acromaster.controllers')
  .controller('FlowSearchResultsController', ['flash', 'flows', 'PageHeaderService', FlowSearchResultsController]);
