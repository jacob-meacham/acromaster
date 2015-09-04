'use strict';

describe('FlowStatsService', function() {
  beforeEach(module('acromaster'));
  var flowService;
  var flowStatsService;
  var flow;

  before(function() {
    flow = {
      moves: [
        { duration: 60, move: { difficulty: 10} },
        { duration: 60, move: { difficulty: 0} },
        { duration: 60, move: { difficulty: 10} },
        { duration: 60, move: { difficulty: 0} }
      ]
    };
  });

  beforeEach(function() {
    flowService = {
      getCurrentFlow: function() { }
    };

    module(function ($provide) {
      $provide.value('FlowService', flowService);
    });

    inject(function(FlowStatsService) {
      flowStatsService = FlowStatsService;
    });
  });

  it('should return empty if no flow is specified', function() {
    var stats = flowStatsService.getStats();
    stats.should.be.empty;

    stats = flowStatsService.getStats({});
    stats.should.be.empty;
  });

  it('should handle a flow with no moves', function() {
    var stats = flowStatsService.getStats({moves: []});
    stats.difficulty.should.eql(0);
    stats.totalTime.should.eql(0);
    stats.numMoves.should.eql(0);
  });

  it('should return stats if a flow is passed in', function() {
    var stats = flowStatsService.getStats(flow);
    stats.difficulty.should.eql(5);
    stats.totalTime.should.eql(4);
    stats.numMoves.should.eql(4);
  });

  it('should use the flow from the flowService with no flow', function() {
    sinon.stub(flowService, 'getCurrentFlow').returns(flow);

    var stats = flowStatsService.getStats(flow);
    stats.difficulty.should.eql(5);
    stats.totalTime.should.eql(4);
    stats.numMoves.should.eql(4);
  });
});