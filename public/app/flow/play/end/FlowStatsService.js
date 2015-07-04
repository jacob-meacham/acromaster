'use strict';

var FlowStatsService = function(flowService) {
  return {
    getStats : function(flow) {
      if (!flow) {
        flow = flowService.getCurrentFlow();
      }

      if(!flow || !flow.moves) {
        return {};
      }

      var stats = {
        totalTime: 0,
        difficulty: 0,
        numMoves: flow.moves.length
      };

      angular.forEach(flow.moves, function(entry) {
        stats.totalTime += entry.duration;
        stats.difficulty += entry.move.difficulty;
      });
      
      stats.totalTime /= 60;

      if (flow.moves.length !== 0) {
        stats.difficulty /= flow.moves.length;
      }

      return stats;
    }
  };
};

angular.module('acromaster.services')
  .factory('FlowStatsService', ['FlowService', FlowStatsService]);