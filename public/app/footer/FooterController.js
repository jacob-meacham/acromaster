'use strict';

var FooterController = function($modal) {
  var vm = this;

  vm.about = function() {
    $modal.open({
      templateUrl: 'app/about/about.html',
      controller: 'AboutController as vm',
      size: 'lg',
      backdrop: true,
      backdropClass: 'about-backdrop',
      windowClass: 'about-modal-window'
    });
  };
};

angular.module('acromaster.controllers')
  .controller('FooterController', ['$modal', FooterController]);
