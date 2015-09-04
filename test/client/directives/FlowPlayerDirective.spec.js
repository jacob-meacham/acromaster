'use strict';

describe('FlowPlayerDirective', function() {
  beforeEach(module('acromaster', 'acromaster.templates'));

  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('FlowPlayerDirectiveController negative test', function() {
    it('should call the callback if no flow can be found', function() {
      var $controller;
      var $rootScope;
      inject(function(_$controller_, _$rootScope_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
      });

      var controllerFn = $controller('FlowPlayerDirectiveController', {$scope: $rootScope}, true);
      var endSpy = controllerFn.instance.onFlowEnd = sandbox.spy();

      controllerFn();

      endSpy.should.have.been.calledWith('no flow specified');
    });
  });

  describe('FlowPlayerDirectiveController', function() {
    var ctrl;
    var $interval;
    var $rootScope;
    var $httpBackend;
    var deferred;
    var endSpy;
    var flowDef;

    beforeEach(function() {
      flowDef = [
        {move: {name: 'move1', audioUri: 'audio1'}, duration: 10},
        {move: {name: 'move2', audioUri: 'audio2'}, duration: 20},
        {move: {name: 'move3', audioUri: 'audio3'}, duration: 30}
      ];
    });

    beforeEach(inject(function($controller, _$rootScope_, _$interval_, _$httpBackend_, $q, Flow) {
      $rootScope = _$rootScope_;
      $interval = _$interval_;
      $httpBackend = _$httpBackend_;
      var controllerFn = $controller('FlowPlayerDirectiveController', {$scope: $rootScope, $interval: $interval}, true);
      controllerFn.instance.flow = new Flow({moves: flowDef});
      endSpy = controllerFn.instance.onFlowEnd = sandbox.spy();

      // The real flow object always has a promise attached, so we need to simulate the promise.
      deferred = $q.defer();
      controllerFn.instance.flow.$promise = deferred.promise;
      ctrl = controllerFn();
    }));

    it('should allow setting audio on the audio element', function() {
      ctrl.audio.paused.should.be.true;

      ctrl.setAudio('testAudio');
      ctrl.audio.src.should.eql('testAudio');
      ctrl.audio.paused.should.be.false;
    });

    it('should allow playing the audio element', function() {
      ctrl.play();
      ctrl.audio.paused.should.be.false;
    });

    it('should allow pausing the audio element', function() {
      ctrl.play();
      ctrl.audio.paused.should.be.false;
      ctrl.pause();
      ctrl.audio.paused.should.be.true;
    });

    it('should start the flow', function() {
      var audioSpy = sandbox.spy(ctrl, 'setAudio');
      ctrl.hasStarted.should.be.false;
      ctrl.start();

      deferred.resolve();
      $rootScope.$apply();
      
      ctrl.hasStarted.should.be.true;

      ctrl.currentMove.should.eql(flowDef[0].move);
      audioSpy.should.have.been.calledWith('audio1');
    });

    var advanceMove = function(delay) {
      for(var i = delay; i > 0; i -= 1000) {
        $interval.flush(1001);
      }
    };

    it('should play the flow', function() {
      ctrl.start();

      deferred.resolve();
      $rootScope.$apply();

      ctrl.currentMove.should.eql(flowDef[0].move);
      advanceMove(11000);
      ctrl.currentMove.should.eql(flowDef[1].move);
      advanceMove(21000);
      ctrl.currentMove.should.eql(flowDef[2].move);
    });

    it('should end the flow when it is finished', function() {
      $httpBackend.expectGET('/api/sounds/done').respond('flowFinished.mp3');
      ctrl.start();

      deferred.resolve();
      $rootScope.$apply();

      ctrl.currentMove.should.eql(flowDef[0].move);
      advanceMove(11000);
      ctrl.currentMove.should.eql(flowDef[1].move);
      advanceMove(21000);
      ctrl.currentMove.should.eql(flowDef[2].move);
      advanceMove(31000);

      $httpBackend.flush();
      $interval.flush(3001);
      endSpy.should.have.callCount(1);

      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should cancel the playing flow on $destroy', function() {
      var cancelSpy = sandbox.spy($interval, 'cancel');

      $rootScope.$broadcast('$destroy');
      $rootScope.$apply();
    
      // No interval started, so cancel should not need to be called.
      cancelSpy.should.have.callCount(0);
      
      ctrl.start();

      deferred.resolve();
      $rootScope.$apply();

      $rootScope.$broadcast('$destroy');
      $rootScope.$apply();

      cancelSpy.should.have.callCount(1);
    });

    it('should allow updating the duration', function() {
      ctrl.start();

      deferred.resolve();
      $rootScope.$apply();

      ctrl.timeRemaining.should.eql(10000);
      ctrl.updateDuration();
      ctrl.timeRemaining.should.eql(10000);

      ctrl.speedMultiplier = 2;
      ctrl.updateDuration();
      ctrl.timeRemaining.should.eql(5000);

      ctrl.speedMultiplier = 0.5;
      ctrl.updateDuration();
      ctrl.timeRemaining.should.eql(20000);

      ctrl.speedMultiplier = -1;
      ctrl.updateDuration();
      ctrl.timeRemaining.should.eql(10000);

      advanceMove(9000);
      ctrl.speedMultiplier = 2;
      ctrl.updateDuration();
      ctrl.timeRemaining.should.eql(1000);
    });
  });

  describe('directive', function() {
    var $compile;
    var $rootScope;
    var Flow;

    beforeEach(inject(function(_$compile_,  _$rootScope_, _Flow_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      Flow = _Flow_;
    }));

    it('should bind a flow', function() {
      $rootScope.flow = new Flow();
      var element = $compile('<flowplayer flow="flow"></flowplayer>')($rootScope);
      $rootScope.$digest();

      var ctrl = element.isolateScope().player;
      ctrl.flow.should.eql($rootScope.flow);
    });

    it('should bind a callback', function() {
      $rootScope.flow = new Flow();
      $rootScope.flow.$promise = {}; // Blank promise
      $rootScope.onFlowEnd = sinon.spy();
      var element = $compile('<flowplayer flow="flow" on-flow-end="onFlowEnd()"></flowplayer>')($rootScope);
      $rootScope.$digest();

      var ctrl = element.isolateScope().player;
      ctrl.onFlowEnd();

      $rootScope.onFlowEnd.should.have.callCount(1);
    });
  });
});