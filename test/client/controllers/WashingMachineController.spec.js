'use strict';

describe('WashingMachineController', function() {

  var $controller;
  var $q;
  var WashingMachineServiceStub;
  var $rootScope;

  beforeEach(function() {
    module('acromaster');

    inject(function(_$controller_, _$rootScope_, _$q_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      $q = _$q_;
    });

    // TODO: Would love to stub with sinon-as-promised
    WashingMachineServiceStub = {
      generate: function() {
        return $q(function(resolve) {
          resolve({
            move1: { name: 'move1' },
            move2: { name: 'move2' },
            name: 'WishyWash'
          });
        });
      }
    };
  });

  it('should bind the washing machine to the scope', function() {
    var vm = $controller('WashingMachineViewController', { WashingMachineService : WashingMachineServiceStub });
    $rootScope.$digest();

    vm.move1.should.eql('move1');
    vm.move2.should.eql('move2');
    vm.washing_machine.should.eql('WishyWash');
  });
});