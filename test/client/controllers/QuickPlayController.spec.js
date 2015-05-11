'use strict';

describe('QuickPlayController', function() {
  beforeEach(module('acromaster'));

  var $rootScope;
  var $scope;
  var $location;
  var FlowService;
  var deferred;

  var sandbox;

  beforeEach(inject(function(_$rootScope_, $controller, $q) {
    $rootScope = _$rootScope_;
    deferred = $q.defer();

    sandbox = sinon.sandbox.create();
    FlowService = {
      generateFlow: sandbox.stub().returns(deferred.promise)
    };
    
    $location = {
      path: function() {}
    };

    var RandomNameService = {
      generateFlowName: function() { return 'My Flow Name'; }
    };

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

    FlowService.generateFlow = {};
    sandbox.stub(FlowService, 'generateFlow', function(params) {
      params.should.eql(expectedParams);
      return deferred.promise;
    });

    $scope.generateFlow();
    deferred.resolve({});
    $rootScope.$apply();
  });

  it('should set the total time correctly', function() {
    $scope.flowParams.totalMinutes = 10;
    $scope.generateFlow();
    deferred.resolve({});
    $rootScope.$apply();

    $scope.flowParams.totalTime.should.eql(10*60);
  });

  it('should set the location to quick play', function() {
    var flowId = 'myFlowId';

    var pathStub = sandbox.stub($location, 'path', function(path) {
      path.should.eql('/flow/myFlowId/play');
    });

    $scope.generateFlow();
    deferred.resolve({id: flowId});
    $rootScope.$apply();
    pathStub.should.have.callCount(1);
  });
});