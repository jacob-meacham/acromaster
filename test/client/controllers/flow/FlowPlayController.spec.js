'use strict';

describe('FlowPlayController', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  var $controller;
  
  var flow;
  var flowService;
  var $location;
  var $scope;
  
  before(function() {
    flow = {
      moves: [
        { duration: 60, move: { difficulty: 10} },
        { duration: 60, move: { difficulty: 0} },
        { duration: 60, move: { difficulty: 10} },
        { duration: 60, move: { difficulty: 0} }
      ]
    };
  });

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    inject(function(_$controller_, FlowService, _$location_, $rootScope) {
      $controller = _$controller_;
      flowService = FlowService;
      $location = _$location_;
      $scope = $rootScope.$new();
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should use the cached flow', function() {
    var getStub = sandbox.stub(flowService, 'getCurrentFlow').returns(flow);
    var instantiateStub = sandbox.stub(flowService, 'instantiateFlow').throws();
    var vm = $controller('FlowPlayController', {$scope: $scope});

    instantiateStub.should.have.callCount(0);
    getStub.should.have.callCount(1);

    vm.flow.should.eql(flow);
  });

  it('should use a flow from the server', function() {
    sandbox.stub(flowService, 'instantiateFlow').returns(flow);
    var vm = $controller('FlowPlayController', {$scope: $scope});

    vm.flow.should.eql(flow);
  });

  it('should redirect on error', function() {
    var pathSpy = sandbox.spy($location, 'path');
    var vm = $controller('FlowPlayController', {$scope: $scope});

    vm.onFlowEnd('err');
    pathSpy.should.have.been.calledWith('/');
  });

  it('should send to end on finish', function() {
    var pathSpy = sandbox.spy($location, 'path');
    var vm = $controller('FlowPlayController', {$scope: $scope});

    vm.onFlowEnd();
    pathSpy.should.have.been.calledWith('/flow/end');
  });
});