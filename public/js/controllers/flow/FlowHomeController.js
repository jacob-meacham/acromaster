'use strict';

var FlowHomeController = function($scope, $location, Flow, PageHeaderService) {
  Flow.get({random: true, max: 11}, function(response) {
    $scope.randomFlow = response.flows[0];
    $scope.featuredFlows = response.flows.slice(1, response.total);
  });

  PageHeaderService.setTitle('Acromaster - Flows');

  $scope.search = function() {
    $location.path('/flows/results').search({search_query: $scope.searchQuery});
  };
};

var controllers = angular.module('acromaster.controllers');
controllers.controller('FlowHomeController', ['$scope', '$location', 'Flow', 'PageHeaderService', FlowHomeController]);
