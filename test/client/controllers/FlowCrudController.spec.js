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

  describe('FlowSearchResultsController', function() {
    it('should start with the resolved flows', function() {
      var flows = [{name: 'flow1'}, {name: 'flow2'}];
      var flowsPromise = {
        flows: flows
      };

      $controller('FlowSearchResultsController', {$scope: $scope, flows: flowsPromise});
      $scope.flows.should.eql(flows);
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
    var $modal;

    beforeEach(inject(function(Flow, _FlowService_, _$location_, _AuthService_, _$modal_) {
      flow = new Flow({moves: []});
      flow.id = '10';

      FlowService = _FlowService_;
      AuthService = _AuthService_;
      $location = _$location_;
      $modal = _$modal_;
    }));

    it('should start with a flow from the FlowService', function() {
      var flowStub = sandbox.stub(FlowService, 'instantiateFlow').returns(flow);
      var userStub = sandbox.stub(AuthService, 'getUser').returns({id: 'userId'});
      sandbox.stub(AuthService, 'isAuthenticated').returns(true);
      $controller('FlowViewController', {$scope: $scope});

      $scope.flow.should.eql(flow);
      flowStub.should.have.callCount(1);
      userStub.should.have.callCount(1);
    });

    it('should redirect on save success', function() {
      var pathSpy = sandbox.spy($location, 'path');
      sandbox.stub(FlowService, 'instantiateFlow').returns(flow);
      sandbox.stub(AuthService, 'getUser').returns({id: 'userId'});
      sandbox.stub(AuthService, 'isAuthenticated').returns(true);

      $controller('FlowViewController', {$scope: $scope});

      $scope.start();
      pathSpy.should.have.been.calledWith('/flow/10/play');
    });

    it('should set the edit state', function() {
      sandbox.stub(FlowService, 'instantiateFlow', function(id, cb) {
        cb();
        return flow;
      });

      var authStub = sandbox.stub(AuthService, 'canEdit').returns(true);
      $controller('FlowViewController', {$scope: $scope});
      $scope.canEdit.should.eql(true);

      authStub.restore();
      authStub = sandbox.stub(AuthService, 'canEdit').returns(false);
      $controller('FlowViewController', {$scope: $scope});
      $scope.canEdit.should.eql(false);
    });

    describe('favorited', function() {
      var $routeParams;
      var User;

      beforeEach(inject(function(_$routeParams_, _User_) {
        User = _User_;
        $routeParams = _$routeParams_;
      }));

      var setup = function(isAuthenticated, hasFavorited) {
        $routeParams.flowId = flow.id;

        sandbox.stub(FlowService, 'instantiateFlow').returns(flow);
        sandbox.stub(AuthService, 'isAuthenticated').returns(isAuthenticated);
        sandbox.stub(AuthService, 'getUser').returns({id: 'userId'});
        sandbox.stub(User, 'hasFavorited', function(query, cb) {
          query.flowId.should.eql(flow.id);
          query.userId.should.eql('userId');
          cb({hasFavorited: hasFavorited});
        });
      };

      it('should have the correct state if authenticated and favorited', function() {
        setup(true, true);
        $controller('FlowViewController', {$scope: $scope});
        $scope.hasFavorited.should.eql(true);
        $scope.action.should.eql('Unfavorite');
      });

      it('should have the correct state if authenticated and not favorited', function() {
        setup(true, false);
        $controller('FlowViewController', {$scope: $scope});
        $scope.hasFavorited.should.eql(false);
        $scope.action.should.eql('Favorite');
      });

      it('should have the correct state if not authenticated', function() {
        setup(false, false);
        $controller('FlowViewController', {$scope: $scope});
        $scope.hasFavorited.should.eql(false);
        $scope.action.should.eql('Favorite');
      });

      it('should toggle correctly if authenticated and favorited', function() {
        var favoriteStub = sandbox.stub(User, 'favorite').returns({});
        var unfavoriteStub = sandbox.stub(User, 'unfavorite').returns({});

        setup(true, true);
        $controller('FlowViewController', {$scope: $scope});
        $scope.hasFavorited.should.eql(true);
        
        $scope.toggleFavorite();
        unfavoriteStub.should.have.callCount(1);
        $scope.hasFavorited.should.eql(false);
        $scope.action.should.eql('Favorite');

        $scope.toggleFavorite();
        favoriteStub.should.have.callCount(1);
        $scope.hasFavorited.should.eql(true);
        $scope.action.should.eql('Unfavorite');
      });

      it('should toggle correctly if authenticated and not favorited', function() {
        var favoriteStub = sandbox.stub(User, 'favorite').returns({});
        var unfavoriteStub = sandbox.stub(User, 'unfavorite').returns({});

        setup(true, false);
        $controller('FlowViewController', {$scope: $scope});

        $scope.toggleFavorite();
        favoriteStub.should.have.callCount(1);
        $scope.hasFavorited.should.eql(true);
        $scope.action.should.eql('Unfavorite');

        $scope.toggleFavorite();
        unfavoriteStub.should.have.callCount(1);
        $scope.hasFavorited.should.eql(false);
        $scope.action.should.eql('Favorite');
      });

      it('should not toggle if not authenticated', function() {
        var favoriteStub = sandbox.stub(User, 'favorite').returns({});
        var unfavoriteStub = sandbox.stub(User, 'unfavorite').returns({});

        setup(false, false);
        $controller('FlowViewController', {$scope: $scope});
        $scope.toggleFavorite();
        favoriteStub.should.have.callCount(0);
        unfavoriteStub.should.have.callCount(0);
      });
    });

    describe('delete', function() {
      var $modal;
      var $httpBackend;

      beforeEach(inject(function(_$modal_, _$httpBackend_) {
        $modal = _$modal_;
        $httpBackend = _$httpBackend_;
      }));

      it('should open the a delete modal', function() {
        var openSpy = sandbox.spy($modal, 'open');

        $controller('FlowViewController', { $scope: $scope });

        $scope.delete();
        openSpy.should.have.callCount(1);
      });

      it('should delete the flow if requested', function() {
        sandbox.stub(FlowService, 'instantiateFlow').returns(flow);
        var openSpy = sandbox.spy($modal, 'open');

        $controller('FlowViewController', { $scope: $scope });

        $scope.delete();
        $httpBackend.expectGET('partials/flow/delete_modal.html').respond({});
        $httpBackend.expectGET('/partials/index.html').respond({});
        $scope.$apply();
        $httpBackend.flush();

        openSpy.should.have.callCount(1);

        var locationStub = sandbox.stub($location, 'path');
        $httpBackend.expectDELETE('/api/flow/10').respond({});

        var instance = openSpy.getCall(0).returnValue;
        instance.close(1);
        $scope.$apply();
        $httpBackend.flush();

        locationStub.should.have.callCount(1);
        locationStub.getCall(0).args[0].should.eql('/flows/');

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });
    });
  });
});