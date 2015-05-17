'use strict';

describe('FlowSearchResultsController', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  var $scope;
  var $controller;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    $scope = {};

    inject(function(_$controller_) {
      $controller = _$controller_;
      
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should start with the resolved flows', function() {
    var flows = [{name: 'flow1'}, {name: 'flow2'}];
    var flowsPromise = {
      flows: flows
    };

    $controller('FlowSearchResultsController', {$scope: $scope, flows: flowsPromise});
    $scope.flows.should.eql(flows);
  });
});
