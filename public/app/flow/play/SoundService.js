'use strict';

var SoundService = function($http) {
  var getRoot = function() {
    return $http.get('/api/sounds').then(function(root) {
        return root.data;
      });
  };

  return {
    getRoot: getRoot,

    getDoneSound: function() {
      return getRoot().then(function(root) {
        return root + 'flowFinished.mp3'; // TODO: Firefox doesn't play mp3s?
      });
    },

    getSilence: function() {
      return getRoot().then(function(root) {
        return root + 'soundOfSilence.mp3';
      });
    }
  };
};

angular.module('acromaster.services')
  .factory('SoundService', ['$http', SoundService]);
