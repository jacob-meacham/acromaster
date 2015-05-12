'use strict';

angular.module('acromaster.controllers').controller('PageHeaderController', ['$scope', 'PageHeaderService', function($scope, HeadService) {
  // Not the nicest, but it makes working with this controller much easier (instead of adding a bunch of watches)
  $scope.pageHeader = HeadService;
}]);