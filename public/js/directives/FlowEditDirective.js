'use strict';

angular.module('acromaster.directives')
  .controller('FlowEditDirectiveController', ['_', 'Moves', 'flash', function(_, Moves, flash) {
    var vm = this;

    vm.allMoves = Moves.query();
    vm.moveList = [];

    if (vm.flow.$promise) {
      // TODO: :(
      // Wait for the promise to be fulfilled before instantiating the move list
      vm.flow.$promise.then(function() {
        angular.forEach(vm.flow.moves, function(entry) {
          vm.moveList.push({
            move: entry.move,
            duration: entry.duration
          });
        });
      });
    }

    console.log(vm.flow._id);

    vm.addMove = function() {
      vm.inserted = {
        move: null,
        duration: 20
      };
      
      vm.moveList.push(vm.inserted);
    };

    vm.updateMove = function(index, $data) {
      vm.moveList[index].move = $data;
    };

    vm.removeMove = function(index) {
      vm.moveList.splice(index, 1);
    };

    vm.checkMove = function($data) {
      if (!$data) {
        return 'No move specified';
      }

      if (_.indexOf(vm.allMoves, $data) < 0) {
        return 'Not a valid move';
      }

      return true;
    };

    vm.checkDuration = function($data) {
      if (!$data) {
        return 'Move must have a duration';
      }

      var duration = parseInt($data, 10);
      if (isNaN(duration) || duration < 0) {
        return 'Duration must be a valid number';
      }

      return true;
    };

    vm.save = function() {
      vm.flow.moves = [];
      angular.forEach(vm.moveList, function(entry) {
        vm.flow.moves.push({
          move: entry.move._id,
          duration: entry.duration
        });
      });
      
      var saveFailure = function() {
        flash.error = 'There was an issue saving your flow. Correct any issues and re-submit';
      };

      if (vm.flow._id) {
        // Update an existing flow
        vm.flow.$update(vm.saveSuccess, saveFailure);
      } else {
        vm.flow.$save(vm.saveSuccess, saveFailure);
      }
    };
  }])
  .directive('floweditor', function() {
    return {
      restrict: 'E',
      scope: {
        flow: '=',
        saveSuccess: '&onSaveSuccess'
      },
      templateUrl: '../../../partials/flow/floweditor.html',
      controller: 'FlowEditDirectiveController',
      controllerAs: 'vm',
      bindToController: true
    };
});