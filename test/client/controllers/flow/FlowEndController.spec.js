'use strict';

describe('FlowEndController', function() {
  beforeEach(module('acromaster'));

  var sandbox;
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
    $controller('FlowEndController');
    spy.should.have.have.been.calledWith('/');
  });

  it('should create default stats options', function() {
    sandbox.stub(flowService, 'getCurrentFlow').returns(flow);
    var vm = $controller('FlowEndController');

    expect(vm.totalTimeOptions).to.exist;
    expect(vm.difficultyOptions).to.exist;
    expect(vm.numMovesOptions).to.exist;
  });

  it('should delay setting the stats value', function() {
    sandbox.stub(flowService, 'getCurrentFlow').returns(flow);
    $httpBackend.expectPOST('/api/flow/plays').respond({});

    var vm = $controller('FlowEndController');

    $timeout.flush(700);
    vm.numMovesOptions.value.should.eql(4);
    vm.totalTimeOptions.value.should.eql(0);
    vm.difficultyOptions.value.should.eql(0);

    $timeout.flush(200);
    vm.totalTimeOptions.value.should.eql(4);
    vm.difficultyOptions.value.should.eql(0);

    $timeout.flush(200);
    vm.difficultyOptions.value.should.eql(5);

    $timeout.verifyNoPendingTasks();
  });
});