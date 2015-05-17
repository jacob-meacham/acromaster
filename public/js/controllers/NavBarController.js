'use strict';

var NavbarController = function($modal, authService) {
  var vm = this;
  var resetAuth = function() {
    vm.user = authService.getUser();
    vm.authenticated = authService.isAuthenticated();
  };

  vm.logout = function() {
    authService.logout(resetAuth);
  };

  vm.about = function() {
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
};

angular.module('acromaster.controllers')
  .controller('NavbarController', ['$modal', 'AuthService', NavbarController]);
