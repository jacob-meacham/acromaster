'use strict';

var Moves = function($resource) {
  return $resource('/api/moves');
};

angular.module('acromaster.services')
  .factory('Moves', ['$resource', Moves]);