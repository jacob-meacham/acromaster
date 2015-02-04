'use strict';

angular.module('acromaster.controllers').controller('AboutController', ['$scope', 'VersionService', function($scope, version) {
  version.getVersion().success(function(ver) {
    $scope.version = ver;
  });
}]);