'use strict';

var acromasterServices = angular.module('acromaster.services');

acromasterServices.factory('User', ['$resource', function($resource) {
    return $resource('/api/profile/:userId', {
      flowId: '@flowId',
      userId: '@userId'
    },
    {
      favorite: { method: 'POST', url: '/api/profile/:userId/favorites/:flowId' },
      unfavorite: { method: 'DELETE', url: '/api/profile/:userId/favorites/:flowId' },
      getFavorites: { method: 'GET', url: '/api/profile/:userId/favorites' },
      hasFavorited: { method: 'GET', url: '/api/profile/:userId/favorites/:flowId' }
    });
  }
]);
