'use strict';

describe('FlowViewController', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  var $scope;
  var $controller;

  var flow;
  var FlowService;
  var AuthService;
  var $location;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    inject(function(_$controller_, $rootScope, Flow, _FlowService_, _$location_, _AuthService_) {
      $controller = _$controller_;
      $scope = $rootScope.$new();
      
      flow = new Flow({moves: []});
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
