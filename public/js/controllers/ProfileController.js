'use strict';

angular.module('acromaster.controllers').controller('ProfileController', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
  // TODO: Use service instead of http
  $http.get('/api/profile/' + $routeParams.user).success(function(profile) {
    $scope.profile = profile;
  });
}]);