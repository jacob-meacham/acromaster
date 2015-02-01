'use strict';

angular.module('acromaster.controllers').controller('NavbarController', ['$scope', '$http', '$location', '$route', 'AuthService', function($scope, $http, $location, $route, AuthService) {
  var resetAuth = function() {
    $scope.user = AuthService.getUser();
    $scope.authenticated = AuthService.isAuthenticated();
  };

  $scope.logout = function() {
    $http.get('/logout').success(function() {
      AuthService.clearUser();
      resetAuth();

      $location.url('/');
      $route.reload();
    });
  };

  resetAuth();
}]);