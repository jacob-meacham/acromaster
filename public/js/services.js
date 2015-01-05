'use strict';

var acromasterServices = angular.module('acromaster.services', ['ngResource']);

acromasterServices.factory('Flow', ['$resource',
  function($resource){
    return $resource('/api/flow/:flowId', {
      flowId: '@id'
    },
    {
      update: { method: 'PUT' },
      generate: { method:'GET', url:'/api/flow/generate' }
    });
  }]
);

acromasterServices.factory('Moves', ['$resource', function($resource) {
  return $resource('/api/moves');
}]);

acromasterServices.service('flowService', function() {
  var flow = null;
  return {
    setFlow: function(_flow) { flow = _flow; },
    getFlow: function() { return flow; }
  };
});

acromasterServices.factory('authService', [function() {
    function isEmpty(obj) {
      for(var prop in obj) {
          if(obj.hasOwnProperty(prop))
              return false;
      }

      return true;
    }

    var currentUser = window.user ? window.user : null;
    var service = {
        getUser: function() {
          return currentUser;
        },

        isAuthenticated: function() {
          return !!currentUser && !isEmpty(currentUser);
        },

        setUser: function(user) {
          currentUser = user;
        },

        clearUser: function() {
          currentUser = null;
        }
    };

    return service;
  }
]);