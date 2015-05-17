'use strict';

describe('FlowCreateController', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  var $controller;

  var Flow;
  var FlowService;
  var $location;
  var $routeParams;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    inject(function(_$controller_, _Flow_, _FlowService_, _$location_, _$routeParams_) {
      $controller = _$controller_;
      Flow = _Flow_;
      FlowService = _FlowService_;
      $location = _$location_;
      $routeParams = _$routeParams_;
    });
  });

  afterEach(function() {
    sandbox.restore();
  });
  
  it('should start with an empty flow', function() {
    var expected = new Flow({moves: []});
    var vm = $controller('FlowCreateController');

    vm.flow.should.eql(expected);
  });

  it('should redirect on save success', function() {
    var pathSpy = sandbox.spy($location, 'path');
    var vm = $controller('FlowCreateController');

    var flow = new Flow();
    flow.id = '10';
    vm.saveSuccess(flow);
    pathSpy.should.have.been.calledWith('/flow/10');
  });

  it('should instantiate the passed in flow', function() {
    $routeParams.flowId = 'abc123';
    var instantiateSpy = sandbox.stub(FlowService, 'instantiateFlow', function(id, cb) {
      id.should.eql('abc123');
      cb({moves: ['a', 'b'], name: 'My Flow'});
    });

    var vm = $controller('FlowCreateController');
    vm.flow.moves.should.eql(['a', 'b']);
    vm.flow.name.should.eql('Remix of My Flow');

    instantiateSpy.should.have.callCount(1);
  });
});
