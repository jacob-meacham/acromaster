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

  describe('FlowHomeController', function() {
    var Flow;
    var $location;

    beforeEach(inject(function(_Flow_, _$location_) {
      Flow = _Flow_;
      $location = _$location_;
    }));

    it('should start with a random flow and feature flows', function() {
      var flows = [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}];
      sandbox.stub(Flow, 'get', function(query, callback) {
        callback({flows: flows, total: 3});
      });

      $controller('FlowHomeController', {$scope: $scope, Flow: Flow});
      flows.should.contain($scope.randomFlow);
      $scope.featuredFlows.should.have.length(2);
      $scope.featuredFlows[0].should.eql(flows[1]);
      $scope.featuredFlows[1].should.eql(flows[2]);
    });

    it('should expose find', function() {
      var locationSpy = sandbox.spy($location, 'path');

      $controller('FlowHomeController', {$scope: $scope, Flow: Flow});
      $scope.searchQuery = 'beginner';
      $scope.search();

      // Ensure that the location is set correctly, with the query param.
      locationSpy.should.have.callCount(1);
      locationSpy.returnValues[0].$$url.should.eql('/flows/results?search_query=beginner');
    });
  });

  describe('FlowCreateController', function() {
    var Flow;
    var FlowService;
    var $location;
    var $routeParams;

    beforeEach(inject(function(_Flow_, _FlowService_, _$location_, _$routeParams_) {
      Flow = _Flow_;
      FlowService = _FlowService_;
      $location = _$location_;
      $routeParams = _$routeParams_;
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

    it('should instantiate the passed in flow', function() {
      $routeParams.flowId = 'abc123';
      var instantiateSpy = sandbox.stub(FlowService, 'instantiateFlow', function(id, cb) {
        id.should.eql('abc123');
        cb({moves: ['a', 'b'], name: 'My Flow'});
      });

      $controller('FlowCreateController', {$scope: $scope, Flow: Flow});
      $scope.flow.moves.should.eql(['a', 'b']);
      $scope.flow.name.should.eql('Remix of My Flow');

      instantiateSpy.should.have.callCount(1);
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
      sandbox.stub(FlowService, 'instantiateFlow', function(id, cb) {
        cb(flow);
      });
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
    var AuthService;
    var $location;

    beforeEach(inject(function(Flow, _FlowService_, _$location_, _AuthService_) {
      flow = new Flow({moves: []});
      flow.id = '10';

      FlowService = _FlowService_;
      AuthService = _AuthService_;
      $location = _$location_;
    }));

    it('should start with a flow from the FlowService', function() {
      var flowStub = sandbox.stub(FlowService, 'instantiateFlow').returns(flow);
      var userStub = sandbox.stub(AuthService, 'getUser').returns({id: 'userId'});
      sandbox.stub(AuthService, 'isAuthenticated').returns(true);
      $controller('FlowViewController', {$scope: $scope, $location: $location, FlowService: FlowService, AuthService: AuthService });

      $scope.flow.should.eql(flow);
      flowStub.should.have.callCount(1);
      userStub.should.have.callCount(1);
    });

    it('should redirect on save success', function() {
      var pathSpy = sandbox.spy($location, 'path');
      sandbox.stub(FlowService, 'instantiateFlow').returns(flow);
      sandbox.stub(AuthService, 'getUser').returns({id: 'userId'});
      sandbox.stub(AuthService, 'isAuthenticated').returns(true);

      $controller('FlowViewController', {$scope: $scope, $location: $location, FlowService: FlowService, AuthService: AuthService });

      $scope.start();
      pathSpy.should.have.been.calledWith('/flow/10/play');
    });
  });
});