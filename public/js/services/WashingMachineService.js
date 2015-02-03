'use strict';
var acromasterServices = angular.module('acromaster.services');

acromasterServices.factory('WashingMachineService', ['Moves', function(Moves) {
  var staticMoves = Moves.query({'tags': 'static'});

  var choose = function(arr) {
    return arr[Math.floor(Math.random()*arr.length)];
  };

  var generateName = function() {
    var name = '';
    if (Math.random() < 0.2) {
      name += 'Goofy ';
    }

    if (Math.random() < 0.5) {
      name += 'Reverse ';
    }

    if (Math.random() < 0.4) {
      var size = ['Tiny', 'Little', 'Big', 'Huge'];
      name = name + choose(size) + ' ';
    }

    if (Math.random() < 0.4) {
      var location = ['Seattle', 'London', 'Dutch', 'Swedish'];
      name = name + choose(location) + ' ';
    }

    var descriptor = ['Grease', 'Tickler', 'Samurai', 'Ninja', 'Secret', 'Plush', 'Star Wars', 'Jedi', 'Krunk', 'Blue', 'Bunny', 'Freezer'];
    name = name + choose(descriptor) + ' ';

    var noun = ['Log', 'Ball', 'Roll', 'Puppet', 'Frog', 'Salamander', 'Twister', 'Whippet', 'Cranberry', 'Taser', 'Freeze', 'Dive', 'Bomb'];
    name = name + choose(noun) + ' ';

    if (Math.random() < 0.1) {
      var modifier = ['Amazingness', 'Friendship', 'the King', 'the Queen'];
      name = name + ' of ' + choose(modifier);
    }
    return name;
  };

  return {
    generate: function() {
      return staticMoves.$promise.then(function() {
        var washingMachine = {};
        washingMachine.move1 = choose(staticMoves);
        washingMachine.move2 = choose(staticMoves);
        while (washingMachine.move2 === washingMachine.move1) {
          washingMachine.move2 = choose(staticMoves);
        }
        washingMachine.name = generateName();
        return washingMachine;
      });
    }
  };
}]);