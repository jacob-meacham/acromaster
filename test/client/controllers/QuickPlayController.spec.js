'use strict';

describe('QuickPlayController', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  var vm;
  var $rootScope;
  var $location;
  var FlowService;
  var deferred;

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

    vm = $controller('WorkoutCreateController', { $location: $location, $scope: $rootScope.$new(), FlowService: FlowService, RandomNameService: RandomNameService });
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('should initialize the scope with appropriate params', function() {
    expect(vm.flowParams).to.not.be.null;
    vm.flowParams.totalMinutes.should.eql(30);

    expect(vm.generateFlow).to.not.be.null;
  });

  it('should generate the flow with the appropriate params', function() {
    vm.flowParams.totalMinutes = 20;
    vm.flowParams.foo = 'foo';

    var expectedParams = vm.flowParams;

    FlowService.generateFlow = {};
    sandbox.stub(FlowService, 'generateFlow', function(params) {
      params.should.eql(expectedParams);
      return deferred.promise;
    });

    vm.generateFlow();
    deferred.resolve({});
    $rootScope.$apply();
  });

  it('should set the total time correctly', function() {
    vm.flowParams.totalMinutes = 10;
    vm.generateFlow();
    deferred.resolve({});
    $rootScope.$apply();

    vm.flowParams.totalTime.should.eql(10*60);
  });

  it('should set the location to quick play', function() {
    var flowId = 'myFlowId';

    var pathStub = sandbox.stub($location, 'path', function(path) {
      path.should.eql('/flow/myFlowId/play');
    });

    vm.generateFlow();
    deferred.resolve({id: flowId});
    $rootScope.$apply();
    pathStub.should.have.callCount(1);
  });
});