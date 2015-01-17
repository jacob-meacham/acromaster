'use strict';

angular.module('acromaster.controllers').controller('AboutController', ['$scope', '$http', function($scope, $http) {
  $http.get('/version').success(function(data) {
    $scope.version = data;
  });
}]);