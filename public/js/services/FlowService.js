'use strict';
var acromasterServices = angular.module('acromaster.services');

acromasterServices.factory('Flow', ['$resource', function($resource) {
    return $resource('/api/flow/:flowId', {
      flowId: '@id'
    },
    {
      update: { method: 'PUT' },
      generate: { method:'GET', url:'/api/flow/generate' },
      like: { method: 'POST', url: '/api/flow/:flowId/likes' },
      unlike: { method: 'DELETE', url: '/api/flow/:flowId/likes' },
      hasLiked: { method: 'GET', url: '/api/flow/:flowId/likes' },
      recordPlay: { method: 'POST', url: '/api/flow/:flowId/plays' }
    });
  }]
);

acromasterServices.factory('FlowSearchInitialData', ['Flow', '$route', function(Flow, $route) {
  return {
    performSearch: function() {
      var params = $route.current.params;
      return Flow.get({search_query: params.search_query, max: params.max, page: params.page}).$promise;
    }
  };
}]);

acromasterServices.factory('Moves', ['$resource', function($resource) {
  return $resource('/api/moves');
}]);

acromasterServices.factory('FlowService', ['Flow', function(Flow) {
  var flow = null;
  return {
    instantiateFlow: function(id) {
      var returnedFlow = Flow.get({flowId: id}, function() {
        flow = returnedFlow;
      });

      return returnedFlow;
    },

    generateFlow: function(params) {
      return Flow.generate(params).$promise.then(function(returnedFlow) {
        flow = returnedFlow;
        return flow;
      });
    },

    getCurrentFlow: function() { return flow; },
    clearCurrentFlow: function() { flow = null; }
  };
}]);