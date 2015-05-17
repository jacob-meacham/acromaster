'use strict';

describe('FlowLikeDirective', function() {
  beforeEach(module('acromaster', 'acromaster.templates'));

  var sandbox;
  var $rootScope;
  var $q;
  
  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    inject(function(_$rootScope_, _$q_) {
      $rootScope = _$rootScope_;
      $q = _$q_;
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('FlowLikeDirectiveController', function() {
    var $httpBackend;

    var $cookieStore;
    var controllerFn;
    var flowPromise;

    beforeEach(inject(function($controller, _$httpBackend_, _$cookieStore_) {
      $httpBackend = _$httpBackend_;
      $cookieStore = _$cookieStore_;

      controllerFn = $controller('LikeDirectiveController', null, true);

      controllerFn.instance.flow = {id: 'flowId', likes: 10};
      flowPromise = $q.defer();
      controllerFn.instance.flow.$promise = flowPromise.promise;
    }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

    describe('withCookie', function() {
      beforeEach(function() {
        sandbox.stub($cookieStore, 'get').returns('cookie');
      });

      it('should start with the correct state when liked', function() {
        $httpBackend.expectGET('/api/flow/flowId/likes?anonId=cookie').respond({hasLiked: true});
        var ctrl = controllerFn();

        flowPromise.resolve();
        $rootScope.$apply();
        $httpBackend.flush();
        
        ctrl.likeCount.should.eql(10);
        ctrl.hasLiked.should.eql(true);
        ctrl.action.should.eql('Unlike');
      });

      it('should start with the correct state when not liked', function() {
        $httpBackend.expectGET('/api/flow/flowId/likes?anonId=cookie').respond({hasLiked: false});
        var ctrl = controllerFn();

        flowPromise.resolve();
        $rootScope.$apply();
        $httpBackend.flush();
        
        ctrl.likeCount.should.eql(10);
        ctrl.hasLiked.should.eql(false);
        ctrl.action.should.eql('Like');
      });

      it('should allow adding a like', function() {
        $httpBackend.expectGET('/api/flow/flowId/likes?anonId=cookie').respond({hasLiked: false});
        var ctrl = controllerFn();

        flowPromise.resolve();
        $rootScope.$apply();
        $httpBackend.flush();

        $httpBackend.expectPOST('/api/flow/flowId/likes?anonId=cookie').respond({});
        ctrl.toggleLike();
        $httpBackend.flush();

        ctrl.likeCount.should.eql(11);
        ctrl.hasLiked.should.eql(true);
        ctrl.action.should.eql('Unlike');
      });

      it('should allow removing a like', function() {
        $httpBackend.expectGET('/api/flow/flowId/likes?anonId=cookie').respond({hasLiked: true});
        var ctrl = controllerFn();

        flowPromise.resolve();
        $rootScope.$apply();
        $httpBackend.flush();

        $httpBackend.expectDELETE('/api/flow/flowId/likes?anonId=cookie').respond({});
        ctrl.toggleLike();
        $httpBackend.flush();

        ctrl.likeCount.should.eql(9);
        ctrl.hasLiked.should.eql(false);
        ctrl.action.should.eql('Like');
      });
    });

    it('should use the stored cookie', function() {
      var cookie;
      sandbox.stub($cookieStore, 'put', function(key, value) {
        key.should.eql('acromasterAnonId');
        cookie = value;
        cookie.should.match(/__anon/);
        $httpBackend.expectGET('/api/flow/flowId/likes?anonId=' + cookie).respond({hasLiked: true});
      });
      
      controllerFn();
      flowPromise.resolve();
      $rootScope.$apply();
      $httpBackend.flush();
    });
  });

  describe('directive', function() {
    var $compile;

    beforeEach(inject(function(_$compile_) {
      $compile = _$compile_;
    }));

    it('should bind a flow', function() {
      // var moves = [{move: 'move1', duration: 30}, {move: 'move3', duration: 100}];
      var deferred = $q.defer();
      $rootScope.flow = {id: 'flowId', likes: 10};
      $rootScope.flow.$promise = deferred.promise;

      var element = $compile('<flowlike flow="flow"></flowlike>')($rootScope);
      $rootScope.$digest();

      var ctrl = element.isolateScope().vm;
      ctrl.flow.should.eql($rootScope.flow);
    });
  });
});