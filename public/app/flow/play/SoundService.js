'use strict';

var SoundService = function($http) {
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
};

angular.module('acromaster.services')
  .factory('SoundService', ['$http', SoundService]);
