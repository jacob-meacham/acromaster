'use strict';

describe('WashingMachineService', function() {
  beforeEach(function() {
    module('angulartics', function($analyticsProvider) { // Make angulartics a no-op, so that it doesn't mess with httpBackend requests.
      $analyticsProvider.developerMode(true);
      $analyticsProvider.virtualPageviews(false);
      $analyticsProvider.firstPageview(false);
    });
    module('acromaster');
  });

  var sandbox;
  var RandomService;
  var WashingMachineService;
  var $httpBackend;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    var numChooseCalls = 0;
    RandomService = {
      random: function() { return 0.01; },
      choose: function(arr) {
        var val;
        if (numChooseCalls === 0 || numChooseCalls === 1) {
          val = arr[1];
        } else {
          val = arr[0];
        }

        numChooseCalls++;
        return val;
      }
    };

    module(function ($provide) {
      $provide.value('RandomService', RandomService);
    });
  });

  beforeEach(inject(function(_$httpBackend_) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/moves?tags=static').respond([{name: 'move1'}, {name: 'move2'}]);
  }));

  beforeEach(inject(function(_WashingMachineService_) {
    WashingMachineService = _WashingMachineService_;
  }));

  afterEach(function() {
    sandbox.restore();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should generate a washing machine', function(done) {
    WashingMachineService.generate().then(function(washingMachine) {
      expect(washingMachine.move1.name).to.eql('move2');
      expect(washingMachine.move2.name).to.eql('move1');
      expect(washingMachine.name).to.eql('Goofy Reverse Tiny Seattle Grease Log of Amazingness');
      done();
    });
    $httpBackend.flush();
  });

  it('should generate a minimal washing machine', function(done) {
    sandbox.stub(RandomService, 'random').returns(1.0);
    WashingMachineService.generate().then(function(washingMachine) {
      expect(washingMachine.move1.name).to.eql('move2');
      expect(washingMachine.move2.name).to.eql('move1');
      expect(washingMachine.name).to.eql('Grease Log');
      done();
    });
    $httpBackend.flush();
  });
});