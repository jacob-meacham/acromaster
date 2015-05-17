'use strict';

var FlowSearchResultsController = function($scope, flowsPromise) {
  $scope.flows = flowsPromise.flows;
};

var controllers = angular.module('acromaster.controllers');
controllers.controller('FlowSearchResultsController', ['$scope', 'flows', FlowSearchResultsController]);
