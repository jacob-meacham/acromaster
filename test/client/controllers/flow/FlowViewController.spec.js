'use strict';

describe('FlowViewController', function() {
  beforeEach(function() {
    module('angulartics', function($analyticsProvider) { // Make angulartics a no-op, so that it doesn't mess with httpBackend requests.
      $analyticsProvider.developerMode(true);
      $analyticsProvider.virtualPageviews(false);
      $analyticsProvider.firstPageview(false);
    });
    module('acromaster');
  });

  var sandbox;
  var $controller;
  var $rootScope;

  var flow;
  var FlowService;
  var AuthService;
  var $location;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    inject(function(_$controller_, _$rootScope_, Flow, _FlowService_, _$location_, _AuthService_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      
      flow = new Flow({name: 'Flow', moves: []});
      flow.id = '10';

      FlowService = _FlowService_;
      AuthService = _AuthService_;
      $location = _$location_;
    });
  });

  afterEach(function() {
    sandbox.restore();
  });
  
  it('should start with a flow from the FlowService', function() {
    var flowStub = sandbox.stub(FlowService, 'instantiateFlow').returns(flow);
    var userStub = sandbox.stub(AuthService, 'getUser').returns({id: 'userId'});
    sandbox.stub(AuthService, 'isAuthenticated').returns(true);
    var vm = $controller('FlowViewController', {$scope: $rootScope.$new()});

    vm.flow.should.eql(flow);
    flowStub.should.have.callCount(1);
    userStub.should.have.callCount(1);
  });

  it('should redirect on save success', function() {
    var pathSpy = sandbox.spy($location, 'path');
    sandbox.stub(FlowService, 'instantiateFlow').returns(flow);
    sandbox.stub(AuthService, 'getUser').returns({id: 'userId'});
    sandbox.stub(AuthService, 'isAuthenticated').returns(true);

    var vm = $controller('FlowViewController', {$scope: $rootScope.$new()});

    vm.start();
    pathSpy.should.have.been.calledWith('/flow/10/play');
  });

  it('should set the edit state', function() {
    sandbox.stub(FlowService, 'instantiateFlow', function(id, cb) {
      cb(flow);
      return flow;
    });

    var authStub = sandbox.stub(AuthService, 'canEdit').returns(true);
    var vm = $controller('FlowViewController', {$scope: $rootScope.$new()});
    vm.canEdit.should.eql(true);

    authStub.restore();
    authStub = sandbox.stub(AuthService, 'canEdit').returns(false);
    vm = $controller('FlowViewController', {$scope: $rootScope.$new()});
    vm.canEdit.should.eql(false);
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
      sandbox.stub(AuthService, 'getUser').returns({username: 'username'});
      sandbox.stub(User, 'hasFavorited', function(query, cb) {
        query.flowId.should.eql(flow.id);
        query.userId.should.eql('username');
        cb({hasFavorited: hasFavorited});
      });
    };

    it('should have the correct state if authenticated and favorited', function() {
      setup(true, true);
      var vm = $controller('FlowViewController', {$scope: $rootScope.$new()});
      vm.hasFavorited.should.eql(true);
      vm.action.should.eql('Remove Favorite');
    });

    it('should have the correct state if authenticated and not favorited', function() {
      setup(true, false);
      var vm = $controller('FlowViewController', {$scope: $rootScope.$new()});
      vm.hasFavorited.should.eql(false);
      vm.action.should.eql('Add Favorite');
    });

    it('should have the correct state if not authenticated', function() {
      setup(false, false);
      var vm = $controller('FlowViewController', {$scope: $rootScope.$new()});
      vm.hasFavorited.should.eql(false);
      vm.action.should.eql('Add Favorite');
    });

    it('should toggle correctly if authenticated and favorited', function() {
      var favoriteStub = sandbox.stub(User, 'favorite').returns({});
      var unfavoriteStub = sandbox.stub(User, 'unfavorite').returns({});

      setup(true, true);
      var vm = $controller('FlowViewController', {$scope: $rootScope.$new()});
      vm.hasFavorited.should.eql(true);
      
      vm.toggleFavorite();
      unfavoriteStub.should.have.callCount(1);
      vm.hasFavorited.should.eql(false);
      vm.action.should.eql('Add Favorite');

      vm.toggleFavorite();
      favoriteStub.should.have.callCount(1);
      vm.hasFavorited.should.eql(true);
      vm.action.should.eql('Remove Favorite');
    });

    it('should toggle correctly if authenticated and not favorited', function() {
      var favoriteStub = sandbox.stub(User, 'favorite').returns({});
      var unfavoriteStub = sandbox.stub(User, 'unfavorite').returns({});

      setup(true, false);
      var vm = $controller('FlowViewController', {$scope: $rootScope.$new()});

      vm.toggleFavorite();
      favoriteStub.should.have.callCount(1);
      vm.hasFavorited.should.eql(true);
      vm.action.should.eql('Remove Favorite');

      vm.toggleFavorite();
      unfavoriteStub.should.have.callCount(1);
      vm.hasFavorited.should.eql(false);
      vm.action.should.eql('Add Favorite');
    });

    it('should not toggle if not authenticated', function() {
      var favoriteStub = sandbox.stub(User, 'favorite').returns({});
      var unfavoriteStub = sandbox.stub(User, 'unfavorite').returns({});

      setup(false, false);
      var vm = $controller('FlowViewController', {$scope: $rootScope.$new()});
      vm.toggleFavorite();
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

      var vm = $controller('FlowViewController', {$scope: $rootScope.$new()});

      vm.delete();
      openSpy.should.have.callCount(1);
    });

    it('should delete the flow if requested', function() {
      sandbox.stub(FlowService, 'instantiateFlow').returns(flow);
      var openSpy = sandbox.spy($modal, 'open');

      var vm = $controller('FlowViewController', {$scope: $rootScope.$new()});

      vm.delete();
      $httpBackend.expectGET('app/flow/edit/flow-delete-modal.html').respond({});
      $httpBackend.expectGET('/app/home/home.html').respond({});
      $rootScope.$apply();
      $httpBackend.flush();

      openSpy.should.have.callCount(1);

      var locationStub = sandbox.stub($location, 'path');
      $httpBackend.expectDELETE('/api/flow/10').respond({});

      var instance = openSpy.getCall(0).returnValue;
      instance.close(1);
      $rootScope.$apply();
      $httpBackend.flush();

      locationStub.should.have.callCount(1);
      locationStub.getCall(0).args[0].should.eql('/flows/');

      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });
});
