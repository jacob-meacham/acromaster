'use strict';

angular.module('acromaster.controllers').controller('NavbarController', ['$scope', 'AuthService', function($scope, AuthService) {
  var resetAuth = function() {
    $scope.user = AuthService.getUser();
    $scope.authenticated = AuthService.isAuthenticated();
  };

  $scope.logout = function() {
    AuthService.logout(resetAuth);
  };

  resetAuth();
}]);