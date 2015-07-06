'use strict';

describe('FlowEditDirective', function() {
  beforeEach(module('acromaster', 'acromaster.templates'));

  var $rootScope;
  var Moves;
  var $q;

  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    inject(function(_$rootScope_, _Moves_, _$q_, $httpBackend) {
      $rootScope = _$rootScope_;
      Moves = _Moves_;
      $q = _$q_;
      sandbox.stub(Moves, 'query').returns(['move1', 'move2', 'move3']);

      // TODO: This should not be necessary. Remove.
      $httpBackend.expectGET('/app/home/home.html').respond(200, '');
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('FlowEditDirectiveController', function() {
    var controllerFn;
    var flash;

    beforeEach(inject(function($controller, _, _flash_, Flow) {
      flash = _flash_;
      controllerFn = $controller('FlowEditDirectiveController', {_: _, Moves: Moves, flash: flash, $scope: $rootScope.$new()}, true);
      controllerFn.instance.flow = new Flow();
    }));

    it('shoud have no moves with an empty flow', function() {
      var ctrl = controllerFn();
      ctrl.moveList.length.should.eql(0);
    });

    it('should start with moves in the flow', function() {
      var moves = [{move: 'move1', duration: 30}, {move: 'move3', duration: 100}];
      controllerFn.instance.flow = {moves: moves};
      var deferred = $q.defer();
      controllerFn.instance.flow.$promise = deferred.promise;

      var ctrl = controllerFn();
      
      // Resolve the promise and apply it to trigger then()
      deferred.resolve();
      $rootScope.$apply();

      ctrl.moveList.should.eql(moves);
    });

    it('should allow adding a move', function() {
      var ctrl = controllerFn();

      ctrl.addMove();
      ctrl.moveList.length.should.eql(1);
      expect(ctrl.moveList[0].move).to.be.null;
    });

    it('should allow removing a move', function() {
      var ctrl = controllerFn();
      ctrl.addMove();
      ctrl.addMove();
      ctrl.moveList.length.should.eql(2);
      ctrl.moveList[0].move = 'move';
      ctrl.moveList[1].move = 'move2';

      ctrl.removeMove(1);
      ctrl.moveList.length.should.eql(1);
      ctrl.moveList[0].move.should.eql('move');

      ctrl.removeMove(0);
      ctrl.moveList.length.should.eql(0);
    });

    it('should allow updating a move', function() {
      var ctrl = controllerFn();
      ctrl.addMove();
      ctrl.moveList.length.should.eql(1);
      ctrl.updateMove(0, 'move');

      ctrl.moveList[0].move.should.eql('move');
    });

    it('should allow adding a random move', function() {
      var ctrl = controllerFn();
      ctrl.randomMove();
      ctrl.moveList.length.should.eql(1);
      ['move1', 'move2', 'move3'].should.contain(ctrl.moveList[0].move);
    });

    it('should not allow invalid moves', function() {
      var ctrl = controllerFn();
      var ret = ctrl.checkMove(null);
      ret.should.eql('No move specified');

      ret = ctrl.checkMove('move-not-appearing-in-this-test');
      ret.should.eql('Not a valid move');

      ret = ctrl.checkMove('move1');
      ret.should.be.true;
    });

    it('should not allow invalid durations', function() {
      var ctrl = controllerFn();
      var ret = ctrl.checkDuration(null);
      ret.should.eql('Move must have a duration');

      ret = ctrl.checkDuration(-10);
      ret.should.eql('Duration must be a valid number');

      ret = ctrl.checkDuration('xxx');
      ret.should.eql('Duration must be a valid number');

      ret = ctrl.checkDuration(10);
      ret.should.be.true;
    });

    it('should save a new flow', function() {
      var ctrl = controllerFn();
      ctrl.saveSuccess = 'expected-success';
      var saveStub = sandbox.stub(ctrl.flow, '$save');

      var moves = [{move: {id: 0}, duration: 30}, {move: {id: 3}, duration: 100}];
      ctrl.moveList = moves;

      ctrl.save();
      ctrl.flow.moves.length.should.eql(2);
      ctrl.flow.moves[0].move.should.eql(0);
      ctrl.flow.moves[0].duration.should.eql(30);

      saveStub.should.have.been.calledWith(ctrl.saveSuccess);
    });

    it('should update an existing flow', function() {
      controllerFn.instance.flow.id = 10;

      var ctrl = controllerFn();
      ctrl.saveSuccess = 'expected-success';
      var updateStub = sandbox.stub(ctrl.flow, '$update');

      ctrl.save();

      updateStub.should.have.been.calledWith(ctrl.saveSuccess);
    });

    it('should flash an error on save error', function() {
      var ctrl = controllerFn();
      sandbox.stub(ctrl.flow, '$save', function(successCallback, failureCallback) {
        failureCallback();
      });

      ctrl.save();
      flash.error.should.eql('There was an issue saving your flow. Correct any issues and re-submit');
    });
  });

  describe('directive', function() {
    var $compile;
    var Flow;

    beforeEach(inject(function(_$compile_, _Flow_) {
      $compile = _$compile_;
      Flow = _Flow_;
    }));

    it('should have no moves with an empty flow', function() {
      $rootScope.flow = new Flow();
      var element = $compile('<floweditor flow="flow"></floweditor>')($rootScope);
      $rootScope.$digest();

      var ctrl = element.isolateScope().vm;
      ctrl.moveList.should.be.empty;

      element.find('tbody').children().size().should.eql(0);
    });

    it('should bind a flow', function() {
      var moves = [{move: 'move1', duration: 30}, {move: 'move3', duration: 100}];
      var deferred = $q.defer();
      $rootScope.flow = new Flow({moves: moves});
      $rootScope.flow.$promise = deferred.promise;

      var element = $compile('<floweditor flow="flow"></floweditor>')($rootScope);
      deferred.resolve();
      $rootScope.$digest();

      var ctrl = element.isolateScope().vm;
      ctrl.flow.should.eql($rootScope.flow);
      element.find('tbody').children().size().should.eql(2);
    });

    it('should bind a callback', function() {
      $rootScope.flow = new Flow();
      $rootScope.saveSuccess = sinon.spy();
      var element = $compile('<floweditor flow="flow" on-save-success="saveSuccess(flow)"></floweditor>')($rootScope);
      $rootScope.$digest();

      var ctrl = element.isolateScope().vm;
      ctrl.saveSuccess();

      $rootScope.saveSuccess.should.have.callCount(1);
    });
  });
});