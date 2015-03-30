'use strict';

describe('WashingMachineService', function() {
  beforeEach(module('acromaster'));

  var WashingMachineService;
  var $httpBackend;

  beforeEach(function() {
    var numChooseCalls = 0;
    var RandomService = {
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
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should generate a washing machine', function() {
    $httpBackend.flush();
    WashingMachineService.generate().then(function(washingMachine) {
      expect(washingMachine.move1.name).to.eql('move2');
      expect(washingMachine.move2.name).to.eql('move1');
      expect(washingMachine.name).to.eql('Goofy Reverse Tiny Seattle Grease Log of Amazingness');
    });
  });
});