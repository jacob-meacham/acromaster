'use strict';

var User = function($resource) {
  return $resource('/api/profile/:userId', {
    flowId: '@flowId',
    userId: '@userId'
  },
  {
    favorite: { method: 'POST', url: '/api/profile/:userId/favorites/:flowId' },
    unfavorite: { method: 'DELETE', url: '/api/profile/:userId/favorites/:flowId' },
    getFavorites: { method: 'GET', url: '/api/profile/:userId/favorites' },
    hasFavorited: { method: 'GET', url: '/api/profile/:userId/favorites/:flowId' },
    getFlows: { method: 'GET', url: '/api/profile/:userId/flows' }
  });
};

angular.module('acromaster.services')
  .factory('User', ['$resource', User]);
