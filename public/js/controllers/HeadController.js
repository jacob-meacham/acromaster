'use strict';

angular.module('acromaster.controllers').controller('PageController', ['$scope', 'HeadService', function($scope, HeadService) {
  $scope.siteName = HeadService.siteName;
  $scope.title = HeadService.title;
  $scope.description = HeadService.description;
  $scope.keywords = HeadService.keywords;
}]);