'use strict';

angular.module('acromaster.controllers').controller('WorkoutCreateController', ['$scope', '$location', 'FlowService', 'RandomService', function($scope, $location, FlowService, rand) {
  var flowParams = $scope.flowParams = {totalMinutes: 30, difficulty: 3, timePerMove: 15, timeVariance: 10};

  // TODO: Move name generation to service
  var generateName = function() {
    var adjective = '';
    var type_add = '';
    var type = '';
    if (rand.random() < 0.95) {
      adjective = rand.choose(['Funky', 'Spiffy', 'Tiny', 'Huge', 'Spiritual', 'Melodic', 'Supreme', 'Steadfast', 'Urban', 'Greasy']);
    }

    if (rand.random() < 0.3) {
      type_add = rand.choose(['Masters', 'Riders', 'Warriors', 'Lovers', 'Fighters']);
    }

    type = rand.choose(['Dragon', 'Unicorn', 'Centaur', 'Basilisk', 'Demon', 'Samurai', 'Ninja', 'Bunny']);

    // TODO: Use handlebars to generate this
    var name = '';
    if (rand.random() < 0.3) {
      name = 'Flow of the ' + adjective + ' ' + type;
      if (type_add !== '') {
        name += ' ' + type_add;
      }
    } else {
      if (adjective !== '') { adjective = 'The'; }
      name = adjective + ' ' + type;
      if (type_add !== '') {
        name += ' ' + type_add;
      }
      name += ' Flow';
    }

    return name;
  };

  $scope.generateFlow = function() {
    flowParams.totalTime = flowParams.totalMinutes * 60;
    flowParams.flowName = generateName();
    FlowService.generateFlow(flowParams, function(flow) {
      $location.path('/flow/' + flow.id + '/play');
    });
  };
}]);