'use strict';

describe('FlowService', function() {
  beforeEach(module('acromaster'));

  describe('Moves factory', function() {
    var Moves;
    var $httpBackend;

    beforeEach(inject(function(_Moves_, _$httpBackend_) {
      Moves = _Moves_;
      $httpBackend = _$httpBackend_;
    }));

    it('should query all moves', function() {
      $httpBackend.expectGET('/api/moves').respond([]);
      Moves.query();
      $httpBackend.flush();
    });

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });

  describe('FlowService factory', function() {
    var flow = {name: 'newFlow', moves: [{name: 'moveA'}, {name: 'moveB'}]};
    var FlowService;
    var $httpBackend;

    beforeEach(inject(function(_FlowService_, _$httpBackend_) {
      FlowService = _FlowService_;
      $httpBackend = _$httpBackend_;
    }));

    var assertEqualFlows = function(flow1, flow2) {
      flow1.name.should.eql(flow2.name);
      flow1.moves.should.eql(flow2.moves);
    };

    it('should start with no current flow', function() {
      expect(FlowService.getCurrentFlow()).to.be.null();
    });

    it('should get a flow with the specified id', function() {
      $httpBackend.expectGET('/api/flow/test').respond(flow);
      FlowService.instantiateFlow('test', function(returnedFlow) {
        assertEqualFlows(returnedFlow, flow);
      });
      $httpBackend.flush();
      
      assertEqualFlows(FlowService.getCurrentFlow(), flow);
    });

    it('should generate a flow', function() {
      $httpBackend.expectGET('/api/flow/generate').respond(flow);
      FlowService.generateFlow({}, function(returnedFlow) {
        expect(returnedFlow).to.not.be.null();
      });
      $httpBackend.flush();
      
      assertEqualFlows(FlowService.getCurrentFlow(), flow);
    });

    it('should allow clearing the current flow', function() {
      expect(FlowService.getCurrentFlow()).to.be.null();

      $httpBackend.expectGET('/api/flow/test').respond(flow);
      FlowService.instantiateFlow('test');
      $httpBackend.flush();
      
      assertEqualFlows(FlowService.getCurrentFlow(), flow);

      FlowService.clearCurrentFlow();
      expect(FlowService.getCurrentFlow()).to.be.null();
    });

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });
});