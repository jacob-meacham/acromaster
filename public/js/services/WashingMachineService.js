'use strict';
var acromasterServices = angular.module('acromaster.services');

acromasterServices.factory('WashingMachineService', ['Moves', 'RandomService', function(Moves, rand) {
  var staticMoves = Moves.query({'tags': 'static'});

  var generateName = function() {
    var name = '';
    if (rand.random() < 0.2) {
      name += 'Goofy ';
    }

    if (rand.random() < 0.5) {
      name += 'Reverse ';
    }

    if (rand.random() < 0.4) {
      var size = ['Tiny', 'Little', 'Big', 'Huge'];
      name = name + rand.choose(size) + ' ';
    }

    if (rand.random() < 0.4) {
      var location = ['Seattle', 'London', 'Dutch', 'Swedish'];
      name = name + rand.choose(location) + ' ';
    }

    var descriptor = ['Grease', 'Tickler', 'Samurai', 'Ninja', 'Secret', 'Plush', 'Star Wars', 'Jedi', 'Krunk', 'Blue', 'Bunny', 'Freezer'];
    name = name + rand.choose(descriptor) + ' ';

    var noun = ['Log', 'Ball', 'Roll', 'Puppet', 'Frog', 'Salamander', 'Twister', 'Whippet', 'Cranberry', 'Taser', 'Freeze', 'Dive', 'Bomb'];
    name = name + rand.choose(noun);

    if (rand.random() < 0.1) {
      var modifier = ['Amazingness', 'Friendship', 'the King', 'the Queen'];
      name = name + ' of ' + rand.choose(modifier);
    }
    return name;
  };

  return {
    generate: function() {
      return staticMoves.$promise.then(function() {
        var washingMachine = {};
        washingMachine.move1 = rand.choose(staticMoves);
        washingMachine.move2 = rand.choose(staticMoves);
        var maxIterations = 5;
        var iterations = 0;
        while (washingMachine.move2 === washingMachine.move1 && iterations < maxIterations) {
          washingMachine.move2 = rand.choose(staticMoves);
          iterations++;
        }
        washingMachine.name = generateName();
        return washingMachine;
      });
    }
  };
}]);