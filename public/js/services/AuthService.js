'use strict';

angular.module('acromaster.services').factory('AuthService', [function() {
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