'use strict';

var FlowSearchResultsController = function($scope, flowsPromise) {
  $scope.flows = flowsPromise.flows;
};

angular.module('acromaster.controllers')
  .controller('FlowSearchResultsController', ['$scope', 'flows', FlowSearchResultsController]);
