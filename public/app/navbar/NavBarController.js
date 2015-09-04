'use strict';

var NavbarController = function(authService) {
  var vm = this;
  var resetAuth = function() {
    vm.user = authService.getUser();
    vm.authenticated = authService.isAuthenticated();
  };

  vm.logout = function() {
    authService.logout(resetAuth);
  };

  resetAuth();
};

angular.module('acromaster.controllers')
  .controller('NavbarController', ['AuthService', NavbarController]);
