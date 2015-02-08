'use strict';

describe('WashingMachineController', function() {

  var $controller;
  var $q;
  var WashingMachineServiceStub;
  var scope;

  beforeEach(function() {
    module('acromaster');

    inject(function(_$controller_, $rootScope, _$q_) {
      scope = $rootScope.$new();
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
    $controller('WashingMachineViewController', { $scope: scope, WashingMachineService : WashingMachineServiceStub });
    scope.$digest();

    scope.move1.name.should.eql('move1');
    scope.move2.name.should.eql('move2');
    scope.washing_machine.should.eql('WishyWash');
  });
});