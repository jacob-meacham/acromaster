'use strict';

describe('FlowEndController', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  var $scope;
  var $controller;
  
  var flow;
  var flowService;
  var $location;
  var $timeout;
  var $httpBackend;

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
    $scope = {};

    inject(function(_$controller_, FlowService, _$location_, _$timeout_, _$httpBackend_) {
      $controller = _$controller_;

      flowService = FlowService;
      $location = _$location_;
      $timeout = _$timeout_;
      $httpBackend = _$httpBackend_;
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should redirect to / if no flow exists', function() {
    var spy = sandbox.spy($location, 'path');

    $controller('FlowEndController', {$scope: $scope});

    spy.should.have.have.been.calledWith('/');
  });

  it('should create default stats options', function() {
    sandbox.stub(flowService, 'getCurrentFlow').returns(flow);
    $controller('FlowEndController', {$scope: $scope});

    expect($scope.totalTimeOptions).to.exist;
    expect($scope.difficultyOptions).to.exist;
    expect($scope.numMovesOptions).to.exist;
  });

  it('should delay setting the stats value', function() {
    sandbox.stub(flowService, 'getCurrentFlow').returns(flow);
    $httpBackend.expectPOST('/api/flow/plays').respond({});

    $controller('FlowEndController', {$scope: $scope});

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