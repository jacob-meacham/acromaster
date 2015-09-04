'use strict';

describe('FlowService', function() {
  beforeEach(module('acromaster'));

  describe('FlowService', function() {
    var flow = {name: 'newFlow', moves: [{name: 'moveA'}, {name: 'moveB'}]};
    var FlowService;
    var $httpBackend;
    var sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      
      inject(function(_FlowService_, _$httpBackend_) {
        FlowService = _FlowService_;
        $httpBackend = _$httpBackend_;
      });
    });

    afterEach(function() {
      sandbox.restore();
    });

    var assertEqualFlows = function(flow1, flow2) {
      flow1.name.should.eql(flow2.name);
      flow1.moves.should.eql(flow2.moves);
    };

    it('should start with no current flow', function() {
      expect(FlowService.getCurrentFlow()).to.be.null;
    });

    it('should get a flow with the specified id', function() {
      $httpBackend.expectGET('/api/flow/test').respond(flow);
      var instantiateSpy = sandbox.spy();
      FlowService.instantiateFlow('test', instantiateSpy);
      $httpBackend.flush();

      instantiateSpy.should.have.callCount(1);
      assertEqualFlows(instantiateSpy.getCall(0).args[0], flow);
      assertEqualFlows(FlowService.getCurrentFlow(), flow);
    });

    it('should generate a flow', function() {
      $httpBackend.expectGET('/api/flow/generate').respond(flow);
      FlowService.generateFlow({}, function(returnedFlow) {
        expect(returnedFlow).to.not.be.null;
      });
      $httpBackend.flush();
      
      assertEqualFlows(FlowService.getCurrentFlow(), flow);
    });

    it('should allow clearing the current flow', function() {
      expect(FlowService.getCurrentFlow()).to.be.null;

      $httpBackend.expectGET('/api/flow/test').respond(flow);
      FlowService.instantiateFlow('test');
      $httpBackend.flush();
      
      assertEqualFlows(FlowService.getCurrentFlow(), flow);

      FlowService.clearCurrentFlow();
      expect(FlowService.getCurrentFlow()).to.be.null;
    });

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });

  describe('FlowSearchInitialData', function() {
    var FlowSearchInitialData;
    var Flow;
    var $rootScope;
    var $httpBackend;
    var $route;

    beforeEach(inject(function(_FlowSearchInitialData_, _Flow_, _$rootScope_, _$httpBackend_, _$route_) {
      FlowSearchInitialData = _FlowSearchInitialData_;
      Flow = _Flow_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      $route = _$route_;
    }));

    it('should perform a search', function(done) {
      $route.current = {
        params: {
          max: 10,
          page: 1,
          search_query: 'fooQuery'
        }
      };

      var searchSpy = sinon.spy(Flow, 'get');
      $httpBackend.expectGET('/api/flow?max=10&page=1&search_query=fooQuery').respond({name: 'newFlow'}, {name: 'flow2'});

      // TODO: This should not be necessary. Remove.
      $httpBackend.expectGET('/app/home/home.html').respond(200, '');

      var promise = FlowSearchInitialData.performSearch();
      $httpBackend.flush();

      searchSpy.should.have.callCount(1);
      searchSpy.getCall(0).args[0].should.eql({search_query: 'fooQuery', max: 10, page: 1});
      promise.then(function(flows) {
        flows.name.should.eql('newFlow');
        done();
      });

      $rootScope.$apply();
    });

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });
});