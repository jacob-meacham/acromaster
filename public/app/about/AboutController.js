'use strict';

var AboutController = function($modalInstance, version) {
  var vm = this;
  version.getVersion().success(function(ver) {
    vm.version = ver;
  });

  vm.exit = function() {
    $modalInstance.dismiss('exit');
  };
};

angular.module('acromaster.controllers')
  .controller('AboutController', ['$modalInstance', 'VersionService', AboutController]);
  