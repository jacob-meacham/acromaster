'use strict';

var HomeController = function(pageHeaderService) {
  pageHeaderService.setTitle();
};

angular.module('acromaster.controllers')
  .controller('HomeController', ['PageHeaderService', HomeController]);
