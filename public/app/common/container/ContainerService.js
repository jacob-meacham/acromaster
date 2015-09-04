'use strict';

var ContainerService = function() {
  this.fluid = false;

  this.setFluid = function(fluid) {
    this.fluid = fluid;
  };

  return this;
};

angular.module('acromaster.services')
  .service('ContainerService', ContainerService);
