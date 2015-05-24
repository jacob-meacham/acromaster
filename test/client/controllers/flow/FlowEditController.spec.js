'use strict';

describe('FlowEditController', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  var $controller;

  var flow;
  var FlowService;
  var $location;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    inject(function(_$controller_, Flow, _FlowService_, _$location_) {
      $controller = _$controller_;

      flow = new Flow({name: 'Flow', moves: []});
      flow.id = '10';

      FlowService = _FlowService_;
      $location = _$location_;
    });
  });

  afterEach(function() {
    sandbox.restore();
  });
  
  it('should start with a flow from the FlowService', function() {
    sandbox.stub(FlowService, 'instantiateFlow', function(id, cb) {
      cb(flow);
    });
    
    var vm = $controller('FlowEditController');
    vm.flow.should.eql(flow);
  });

  it('should redirect on save success', function() {
    var pathSpy = sandbox.spy($location, 'path');
    var vm = $controller('FlowEditController');

    vm.saveSuccess(flow);
    pathSpy.should.have.been.calledWith('/flow/10');
  });
});
