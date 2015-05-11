'use strict';

var acromasterServices = angular.module('acromaster.services');

acromasterServices.factory('SoundService', ['$http', function($http) {
  return {
    getRoot: function() {
      return $http.get('/api/sounds').then(function(root) {
        return root.data;
      });
    },

    getDoneSound: function() {
      return $http.get('/api/sounds/done').then(function(doneSound) {
        return doneSound.data;
      });
    }
  };
}]);