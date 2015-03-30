'use strict';
var acromasterServices = angular.module('acromaster.services');

acromasterServices.factory('Flow', ['$resource',
  function($resource) {
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

acromasterServices.factory('FlowService', ['Flow', function(Flow) {
  var flow = null;
  return {
    instantiateFlow: function(id, callback) {
      var returnedFlow = Flow.get({flowId: id}, function() {
        flow = returnedFlow;
        if (callback) {
          callback(returnedFlow);
        }
      });

      return returnedFlow;
    },
    generateFlow: function(params, callback) {
      var returnedFlow = Flow.generate(params, function() {
        flow = returnedFlow;
        if (callback) {
          callback(flow);
        }
      });

      return returnedFlow;
    },
    getCurrentFlow: function() { return flow; },
    clearCurrentFlow: function() { flow = null; }
  };
}]);