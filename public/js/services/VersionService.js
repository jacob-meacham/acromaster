'use strict';

var acromasterServices = angular.module('acromaster.services');

acromasterServices.factory('VersionService', ['$http', function($http) {
  return {
    getVersion: function() {
      return $http.get('/version').success(function(version) {
        return version;
      });
    }
  };
}]);