'use strict';

angular.module('acromaster.controllers').controller('NavbarController', ['$scope', '$modal', 'AuthService', function($scope, $modal, authService) {
  var resetAuth = function() {
    $scope.user = authService.getUser();
    $scope.authenticated = authService.isAuthenticated();
  };

  $scope.logout = function() {
    authService.logout(resetAuth);
  };

  $scope.about = function() {
    $modal.open({
      templateUrl: 'partials/about.html',
      controller: 'AboutController',
      size: 'lg',
      backdrop: true,
      backdropClass: 'about-backdrop',
      windowClass: 'about-modal-window'
    });
  };

  resetAuth();
}]);