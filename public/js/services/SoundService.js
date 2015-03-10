'use strict';

var acromasterServices = angular.module('acromaster.services');

acromasterServices.factory('SoundService', ['$http', function($http) {
  return {
    getRoot: function() {
      return $http.get('/api/sounds').success(function(root) {
        return root;
      });
    },

    getDoneSound: function() {
      return $http.get('/api/sounds/done').success(function(doneSound) {
        console.log('done: ' + doneSound);
        return doneSound;
      });
    }
  };
}]);