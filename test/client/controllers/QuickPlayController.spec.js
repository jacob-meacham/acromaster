'use strict';

describe('QuickPlayController', function() {
  beforeEach(module('acromaster'));

  var $scope;
  var $location;
  var FlowService;

  var sandbox;

  beforeEach(inject(function($controller) {
    // Stub-stubs
    FlowService = {
      generateFlow: function() {}
    };
    
    $location = {
      path: function() {}
    };

    var RandomNameService = {
      generateFlowName: function() { return 'My Flow Name'; }
    };

    sandbox = sinon.sandbox.create();

    $scope = {};
    $controller('WorkoutCreateController', { $scope: $scope, $location: $location, FlowService: FlowService, RandomNameService: RandomNameService });
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('should initialize the scope with appropriate params', function() {
    expect($scope.flowParams).to.not.be.null;
    $scope.flowParams.totalMinutes.should.eql(30);

    expect($scope.generateFlow).to.not.be.null;
  });

  it('should generate the flow with the appropriate params', function() {
    $scope.flowParams.totalMinutes = 20;
    $scope.flowParams.foo = 'foo';

    var expectedParams = $scope.flowParams;

    sandbox.stub(FlowService, 'generateFlow', function(params) {
      params.should.eql(expectedParams);
    });

    $scope.generateFlow();
  });

  it('should set the total time correctly', function() {
    $scope.flowParams.totalMinutes = 10;
    $scope.generateFlow();

    $scope.flowParams.totalTime.should.eql(10*60);
  });

  it('should set the location to quick play', function() {
    var flowId = 'flowId';
    sandbox.stub(FlowService, 'generateFlow', function(params, callback) {
      callback({id: flowId});
    });

    sandbox.stub($location, 'path', function(path) {
      path.should.eql('/flow/flowId/play');
    });

    $scope.generateFlow();
  });
});