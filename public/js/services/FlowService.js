'use strict';

var Flow = function($resource) {
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
};

var FlowSearchInitialData = function(Flow, $route) {
  return {
    performSearch: function() {
      var params = $route.current.params;
      return Flow.get({search_query: params.search_query, max: params.max, page: params.page}).$promise;
    }
  };
};

var FlowService = function(Flow) {
  var flow = null;
  return {
    // TODO: Change to promise?
    instantiateFlow: function(id, cb) {
      var returnedFlow = Flow.get({flowId: id}, function() {
        if (cb) {
          cb();
        }
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
};

angular.module('acromaster.services')
  .factory('Flow', ['$resource', Flow])
  .factory('FlowSearchInitialData', ['Flow', '$route', FlowSearchInitialData])
  .factory('FlowService', ['Flow', FlowService]);