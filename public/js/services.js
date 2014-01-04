'use strict';

var acromasterServices = angular.module('acromaster.services', ['ngResource']);

acromasterServices.factory('Flow', ['$resource',
  function($resource){
    return $resource('/api/flow/:flowId', {
      flowId: '@id'
    }, {
      generate: { method:'GET', url:'/api/flow/generate' }
    });
  }]
);

acromasterServices.service('flowService', function() {
  var flow = {};
  return {
    setFlow: function(_flow) { flow = _flow; },
    getFlow: function() { return flow; }
  };
});