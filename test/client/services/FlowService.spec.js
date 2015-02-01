'use strict';

describe('FlowService', function() {
  beforeEach(module('acromaster'));

  describe('Flow factory', function() {
    var Flow;
    var $httpBackend;

    beforeEach(inject(function(_Flow_, _$httpBackend_) {
      Flow = _Flow_;
      $httpBackend = _$httpBackend_;
    }));

    it('should get a flow with the specified id', function() {
      $httpBackend.expectGET('/api/flow/test').respond({name: 'flow'});
      Flow.get({flowId: 'test'});
      $httpBackend.flush();
    });

    it('should update a flow with the specified id', function() {
      $httpBackend.expectPUT('/api/flow/test').respond({name: 'flow'});
      Flow.update({id: 'test'});
      $httpBackend.flush();
    });

    it('should ask the backend to generate a flow', function() {
      $httpBackend.expectGET('/api/flow/generate').respond({name: 'flow'});
      Flow.generate();
      $httpBackend.flush();
    });

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });

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
    var flowService;

    beforeEach(inject(function(_flowService_) {
      flowService = _flowService_;
    }));

    it('should return the flow set', function() {
      expect(flowService.getCurrentFlow()).to.be.null();

      var flow = {name: 'foo'};
      flowService.setCurrentFlow(flow);
      flowService.getCurrentFlow().should.equal(flow);
    });

    it('should allow clearing the current flow', function() {
      expect(flowService.getCurrentFlow()).to.be.null();

      var flow = {name: 'foo'};
      flowService.setCurrentFlow(flow);
      flowService.getCurrentFlow().should.equal(flow);

      flowService.clearCurrentFlow();
      expect(flowService.getCurrentFlow()).to.be.null();
    });
  });
});