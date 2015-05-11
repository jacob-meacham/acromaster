'use strict';

angular.module('acromaster.controllers').controller('PageController', ['$scope', 'HeadService', function($scope, HeadService) {
  $scope.siteName = HeadService.getSiteName();
  $scope.title = HeadService.getTitle();
  $scope.description = HeadService.getDescription();
  $scope.keywords = HeadService.getKeywords();
}]);