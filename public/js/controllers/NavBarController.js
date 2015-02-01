'use strict';

angular.module('acromaster.controllers').controller('NavbarController', ['$scope', '$http', '$location', '$route', 'authService', function($scope, $http, $location, $route, authService) {
  var resetAuth = function() {
    $scope.user = authService.getUser();
    $scope.authenticated = authService.isAuthenticated();
  };

  $scope.logout = function() {
    $http.get('/logout').success(function() {
      authService.clearUser();
      resetAuth();

      $location.url('/');
      $route.reload();
    });
  };

  resetAuth();
}]);