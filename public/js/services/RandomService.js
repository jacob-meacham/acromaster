'use strict';

var acromasterServices = angular.module('acromaster.services');

// Because testable code is the best, and why not?
acromasterServices.factory('RandomService', [function() {
  return {
    random: function() {
      return Math.random();
    },

    choose: function(arr) {
      return arr[Math.floor(Math.random()*arr.length)];
    }
  };
}]);