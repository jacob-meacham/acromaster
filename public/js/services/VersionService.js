'use strict';

var VersionService = function($http) {
  return {
    getVersion: function() {
      return $http.get('/version').success(function(version) {
        return version;
      });
    }
  };
};

angular.module('acromaster.services')
  .factory('VersionService', ['$http', VersionService]);
