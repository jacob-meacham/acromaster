'use strict';

describe('FlowSearchResultsController', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  var $controller;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

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

    var vm = $controller('FlowSearchResultsController', {flows: flowsPromise});
    vm.flows.should.eql(flows);
  });
});
