'use strict';

var httpErrorsInterceptor = function($q, $log, flash) {
  return {
    'responseError': function(response) {
      $log.log(response);
      if (response.data.error) {
        flash.error = response.data.error;
      }
      return $q.reject(response);
    }
  };
};

angular.module('acromaster.services')
  .factory('httpErrorsInterceptor', ['$q', '$log', 'flash', httpErrorsInterceptor]);