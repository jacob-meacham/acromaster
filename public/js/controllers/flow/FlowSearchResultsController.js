'use strict';

var FlowSearchResultsController = function(flowsPromise) {
  var vm = this;
  vm.flows = flowsPromise.flows;
};

angular.module('acromaster.controllers')
  .controller('FlowSearchResultsController', ['flows', FlowSearchResultsController]);
