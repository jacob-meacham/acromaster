'use strict';

angular.module('acromaster.controllers').controller('AboutController', ['$scope', '$modalInstance', 'VersionService', function($scope, $modalInstance, version) {
  version.getVersion().success(function(ver) {
    $scope.version = ver;
  });

  $scope.exit = function() {
    $modalInstance.dismiss('exit');
  };
}]);