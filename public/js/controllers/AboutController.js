'use strict';

var AboutController = function($scope, $modalInstance, version) {
  version.getVersion().success(function(ver) {
    $scope.version = ver;
  });

  $scope.exit = function() {
    $modalInstance.dismiss('exit');
  };
};

angular.module('acromaster.controllers')
  .controller('AboutController', ['$scope', '$modalInstance', 'VersionService', AboutController]);
  