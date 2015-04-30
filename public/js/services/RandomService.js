'use strict';

var acromasterServices = angular.module('acromaster.services');

// Because testable code is the best, and why not?
acromasterServices.factory('RandomService', [function() {
  return {
    random: function() {
      return Math.random();
    },

    choose: function(arr) {
      return arr[Math.floor(Math.random()*arr.length)];
    }
  };
}]);

acromasterServices.factory('RandomNameService', ['RandomService', function(rand) {
  return {
    generateFlowName: function() {
      var template = {
        adjective: '',
        type_add: ''
      };
      if (rand.random() < 0.95) {
        template.adjective = rand.choose(['Funky', 'Spiffy', 'Tiny', 'Huge', 'Spiritual', 'Melodic', 'Supreme', 'Steadfast', 'Urban', 'Greasy']);
        template.adjective += ' ';
      }
   
      if (rand.random() < 0.3) {
        template.type_add = ' ';
        template.type_add += rand.choose(['Masters', 'Riders', 'Warriors', 'Lovers', 'Fighters']);
      }
   
      template.type = rand.choose(['Dragon', 'Unicorn', 'Centaur', 'Basilisk', 'Demon', 'Samurai', 'Ninja', 'Bunny']);

      template.epic = (rand.random() < 0.3);

      if (template.epic) {
        return 'Flow of the ' + template.adjective + template.type + template.type_add;
      } else {
        if (template.adjective !== '') { template.adjective = 'The '; }
        return template.adjective + template.type + template.type_add + ' Flow';
      }
    }
  };
}]);