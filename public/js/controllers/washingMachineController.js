'use strict';

angular.module('acromaster.controllers').controller('WashingMachineViewController', ['$scope', '$location', 'Moves', function($scope, $location, Moves) {
  var movesPromise = Moves.query({'tags': 'static'});

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

  $scope.move1 = null;
  $scope.move2 = null;
  $scope.generate = function() {
    movesPromise.$promise.then(function(moves) {
      $scope.move1 = choose(moves);
      $scope.move2 = choose(moves);
      while ($scope.move2 === $scope.move1) {
        $scope.move2 = choose(moves);
      }
      $scope.washing_machine = generateName();
    });
  };

  $scope.$on('$routeChangeSuccess', function () {
    $scope.generate();
  });
}]);