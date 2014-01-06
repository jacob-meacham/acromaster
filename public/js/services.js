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