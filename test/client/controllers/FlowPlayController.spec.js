'use strict';

describe('Flow Controllers', function() {
  beforeEach(module('acromaster'));

  var $controller;
  var sandbox;
  var flow;

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
    inject(function(_$controller_) {
      $controller = _$controller_;
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('FlowPlayController', function() {
    var $scope;
    var locals;
    var $location;
    var flowService;

    beforeEach(inject(function($rootScope, _$location_, FlowService) {
      $scope = $rootScope.$new();
      $location = _$location_;
      flowService = FlowService;

      locals = { $scope: $scope };
    }));

    it('should use the cached flow', function() {
      var getStub = sandbox.stub(flowService, 'getCurrentFlow').returns(flow);
      var instantiateStub = sandbox.stub(flowService, 'instantiateFlow').throws();
      $controller('FlowPlayController', locals);

      instantiateStub.should.have.callCount(0);
      getStub.should.have.callCount(1);

      $scope.flow.should.eql(flow);
    });

    it('should use a flow from the server', function() {
      sandbox.stub(flowService, 'instantiateFlow').returns(flow);
      $controller('FlowPlayController', locals);

      $scope.flow.should.eql(flow);
    });

    it('should redirect on error', function() {
      var pathSpy = sandbox.spy($location, 'path');
      $controller('FlowPlayController', locals);

      $scope.onFlowEnd('err');
      pathSpy.should.have.been.calledWith('/');
    });

    it('should send to end on finish', function() {
      var pathSpy = sandbox.spy($location, 'path');
      $controller('FlowPlayController', locals);

      $scope.onFlowEnd();
      pathSpy.should.have.been.calledWith('/flow/end');
    });
  });

  describe('FlowEndController', function() {
    var $scope;
    var locals;
    var $location;
    var $timeout;
    var flowService;

    beforeEach(inject(function($rootScope, _$location_, FlowService, FlowStatsService, _$timeout_) {
      $scope = $rootScope.$new();
      $location = _$location_;
      $timeout = _$timeout_;
      flowService = FlowService;

      locals = { $scope: $scope };
    }));

    
    it('should redirect to / if no flow exists', function() {
      var spy = sandbox.spy($location, 'path');

      $controller('FlowEndController', locals);

      spy.should.have.have.been.calledWith('/');
    });

    it('should create default stats options', function() {
      sandbox.stub(flowService, 'getCurrentFlow').returns(flow);
      $controller('FlowEndController', locals);

      expect($scope.totalTimeOptions).to.exist;
      expect($scope.difficultyOptions).to.exist;
      expect($scope.numMovesOptions).to.exist;
    });

    it('should delay setting the stats value', function() {
      sandbox.stub(flowService, 'getCurrentFlow').returns(flow);
      $controller('FlowEndController', locals);

      $timeout.flush(700);
      $scope.numMovesOptions.value.should.eql(4);
      $scope.totalTimeOptions.value.should.eql(0);
      $scope.difficultyOptions.value.should.eql(0);

      $timeout.flush(200);
      $scope.totalTimeOptions.value.should.eql(4);
      $scope.difficultyOptions.value.should.eql(0);

      $timeout.flush(200);
      $scope.difficultyOptions.value.should.eql(5);

      $timeout.verifyNoPendingTasks();
    });
  });
});