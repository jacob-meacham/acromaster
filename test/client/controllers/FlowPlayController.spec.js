'use strict';

describe('Flow Controllers', function() {
  beforeEach(module('acromaster'));

  var $controller;

  beforeEach(inject(function(_$controller_) {
    $controller = _$controller_;
  }));

  describe('FlowEndController', function() {
    var scope;
    var locals;
    var $location;
    var $timeout;
    var flowService;
    var flow;

    var sandbox;

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
      sandbox = sinon.sandbox.create();
      inject(function($rootScope, _$location_, FlowService, FlowStatsService, _$timeout_, _) {
        scope = $rootScope.$new();
        $location = _$location_;
        $timeout = _$timeout_;
        flowService = FlowService;

        locals = { $scope: scope, $location: $location, flowService: flowService, flowStats: FlowStatsService, $timeout: $timeout, _: _};
      });
    });

    afterEach(function() {
      sandbox.restore();
    });

    
    it('should redirect to / if no flow exists', function() {
      var spy = sandbox.spy($location, 'path');

      $controller('FlowEndController', locals);

      spy.should.have.have.been.calledWith('/');
    });

    it('should create default stats options', function() {
      sandbox.stub(flowService, 'getCurrentFlow').returns(flow);
      $controller('FlowEndController', locals);

      expect(scope.totalTimeOptions).to.exist();
      expect(scope.difficultyOptions).to.exist();
      expect(scope.numMovesOptions).to.exist();
    });

    it('should delay setting the stats value', function() {
      sandbox.stub(flowService, 'getCurrentFlow').returns(flow);
      $controller('FlowEndController', locals);

      $timeout.flush(700);
      scope.numMovesOptions.value.should.eql(4);
      scope.totalTimeOptions.value.should.eql(0);
      scope.difficultyOptions.value.should.eql(0);

      $timeout.flush(200);
      scope.totalTimeOptions.value.should.eql(4);
      scope.difficultyOptions.value.should.eql(0);

      $timeout.flush(200);
      scope.difficultyOptions.value.should.eql(5);

      $timeout.verifyNoPendingTasks();
    });
  });
});