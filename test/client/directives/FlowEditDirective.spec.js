'use strict';

describe('FlowEditDirective', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('FlowEditDirectiveController', function() {
    var controllerFn;
    var $rootScope;
    var flash;
    var Moves;
    var $q;

    beforeEach(inject(function(_$rootScope_, $controller, _, _flash_, _Moves_, Flow, _$q_) {
      flash = _flash_;
      Moves = _Moves_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      controllerFn = $controller('FlowEditDirectiveController', {_: _, Moves: Moves, flash: flash}, true);
      controllerFn.instance.flow = new Flow();
      sandbox.stub(Moves, 'query').returns(['move1', 'move2', 'move3']);
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
      expect(ctrl.moveList[0].move).to.be.null();
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

    it('should not allow invalid moves', function() {
      var ctrl = controllerFn();
      var ret = ctrl.checkMove(null);
      ret.should.eql('No move specified');

      ret = ctrl.checkMove('move-not-appearing-in-this-test');
      ret.should.eql('Not a valid move');

      ret = ctrl.checkMove('move1');
      ret.should.be.true();
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
      ret.should.be.true();
    });

    it('should save a new flow', function() {
      var ctrl = controllerFn();
      ctrl.saveSuccess = 'expected-success';
      var saveStub = sandbox.stub(ctrl.flow, '$save');

      var moves = [{move: {_id: 0}, duration: 30}, {move: {_id: 3}, duration: 100}];
      ctrl.moveList = moves;

      ctrl.save();
      ctrl.flow.moves.length.should.eql(2);
      ctrl.flow.moves[0].move.should.eql(0);
      ctrl.flow.moves[0].duration.should.eql(30);

      saveStub.should.have.been.calledWith(ctrl.saveSuccess);
    });

    it('should update an existing flow', function() {
      controllerFn.instance.flow._id = 10;

      var ctrl = controllerFn();
      ctrl.saveSuccess = 'expected-success';
      var updateStub = sandbox.stub(ctrl.flow, '$update');

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
    it('should have no moves with an empty flow', function() {

    });

    it('should bind a flow', function() {

    });

    it('should bind a callback', function() {

    });
  });
});