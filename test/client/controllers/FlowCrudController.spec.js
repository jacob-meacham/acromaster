'use strict';

describe('FlowCrudController', function() {
  beforeEach(module('acromaster'));

  var $scope;
  var $controller;
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    inject(function(_$controller_, $rootScope) {
      $controller = _$controller_;
      $scope = $rootScope.$new();
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('FlowListController', function() {
    var Flow;

    beforeEach(inject(function(_Flow_) {
      Flow = _Flow_;
    }));

    it('should start with all flows', function() {
      var flows = [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}];
      var getCallback;
      sandbox.stub(Flow, 'get', function(query, callback) {
        getCallback = callback;
        return {flows: flows};
      });

      $controller('FlowListController', {$scope: $scope, Flow: Flow});
      getCallback();

      $scope.flows.should.eql(flows);
    });

    it('should expose find', function() {
      var query = {name: 'foo', tags: ['static']};
      var flowStub = sandbox.stub(Flow, 'get').returns({});

      $controller('FlowListController', {$scope: $scope, Flow: Flow});
      $scope.find(query);

      flowStub.should.have.callCount(2);
      flowStub.should.have.been.calledWith(query);
    });
  });

  describe('FlowCreateController', function() {
    var Flow;
    var $location;

    beforeEach(inject(function(_Flow_, _$location_) {
      Flow = _Flow_;
      $location = _$location_;
    }));

    it('should start with an empty flow', function() {
      var expected = new Flow({moves: []});
      $controller('FlowCreateController', {$scope: $scope, $location: $location, Flow: Flow});

      $scope.flow.should.eql(expected);
    });

    it('should redirect on save success', function() {
      var pathSpy = sandbox.spy($location, 'path');
      $controller('FlowCreateController', {$scope: $scope, $location: $location, Flow: Flow});

      var flow = new Flow();
      flow.id = '10';
      $scope.saveSuccess(flow);
      pathSpy.should.have.been.calledWith('/flow/10');
    });
  });

  describe('FlowEditController', function() {
    var flow;
    var FlowService;
    var $location;

    beforeEach(inject(function(Flow, _FlowService_, _$location_) {
      flow = new Flow({moves: []});
      flow.id = '10';

      FlowService = _FlowService_;
      $location = _$location_;
    }));

    it('should start with a flow from the FlowService', function() {
      sandbox.stub(FlowService, 'instantiateFlow').returns(flow);
      $controller('FlowEditController', {$scope: $scope, $location: $location, FlowService: FlowService});

      $scope.flow.should.eql(flow);
    });

    it('should redirect on save success', function() {
      var pathSpy = sandbox.spy($location, 'path');
      $controller('FlowEditController', {$scope: $scope, $location: $location, FlowService: FlowService});

      $scope.saveSuccess(flow);
      pathSpy.should.have.been.calledWith('/flow/10');
    });
  });

  describe('FlowViewController', function() {
    var flow;
    var FlowService;
    var $location;

    beforeEach(inject(function(Flow, _FlowService_, _$location_) {
      flow = new Flow({moves: []});
      flow.id = '10';

      FlowService = _FlowService_;
      $location = _$location_;
    }));

    it('should start with a flow from the FlowService', function() {
      sandbox.stub(FlowService, 'instantiateFlow').returns(flow);
      $controller('FlowViewController', {$scope: $scope, $location: $location, FlowService: FlowService});

      $scope.flow.should.eql(flow);
    });

    it('should redirect on save success', function() {
      var pathSpy = sandbox.spy($location, 'path');
      sandbox.stub(FlowService, 'instantiateFlow').returns(flow);
      $controller('FlowViewController', {$scope: $scope, $location: $location, FlowService: FlowService});

      $scope.start();
      pathSpy.should.have.been.calledWith('/flow/10/play');
    });
  });
});