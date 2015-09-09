'use strict';

var httpErrorsInterceptor = function($q, $log, flash) {
  return {
    'responseError': function(response) {
      $log.log(response);
      if (response.data && response.data.error) {
        flash.error = response.data.error;
      } else if (response.status && response.status === 0) {
        flash.error = 'Your request timed out. Please check your connection and try again.';
      } else {
        flash.error = 'An internal server error occurred. Please contact feedback@acromaster.com.';
      }
      return $q.reject(response);
    }
  };
};

angular.module('acromaster.services')
  .factory('httpErrorsInterceptor', ['$q', '$log', 'flash', httpErrorsInterceptor]);