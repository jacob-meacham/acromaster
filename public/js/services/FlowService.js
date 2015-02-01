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

acromasterServices.factory('FlowService', function() {
  var flow = null;
  return {
    setCurrentFlow: function(_flow) { flow = _flow; },
    getCurrentFlow: function() { return flow; },
    clearCurrentFlow: function() { flow = null; }
  };
});