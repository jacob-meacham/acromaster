'use strict';

var AuthService = function($window, $http, $location, $route) {
  function isEmpty(obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        return false;
      }
    }

    return true;
  }

  var currentUser = $window.user ? $window.user : null;
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
    },
  };

  service.canEdit = function(flow) {
    if (!flow) { return false; }
    if (!flow.author) { return false; }
    if (!service.isAuthenticated()) { return false; }

    return currentUser.id === flow.author.id;
  };

  service.logout = function(callback) {
    $http.get('/logout').success(function() {
      $window.user = null;
      service.clearUser();

      if (callback) {
       callback();
      }

      $location.url('/');
      $route.reload();
    });
  };

  return service;
};

angular.module('acromaster.services')
  .factory('AuthService', ['$window', '$http', '$location', '$route', AuthService]);