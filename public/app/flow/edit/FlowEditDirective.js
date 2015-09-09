'use strict';

var FlowEditDirectiveController = function($scope, _, Moves, flash, randomService, authService) {
  var vm = this;

  vm.moveList = [];
  vm.allMoves = Moves.query();
  vm.authenticated = authService.isAuthenticated();
  vm.canEdit = true;
  vm.flash = flash;

  $scope.$watch(function() {
    return vm.flow;
  }, function() {
    vm.moveList = [];
    if (!vm.flow || !vm.flow.moves) {
      return;
    }

    angular.forEach(vm.flow.moves, function(entry) {
      vm.moveList.push({
        move: entry.move,
        duration: entry.duration,
        isNew: false
      });
    });

    if (vm.flow.author) {
      if (!vm.authenticated) { // We're not authenticated, and this flow has an author
        vm.canEdit = false;
      } else if (authService.getUser().id !== vm.flow.author.id) { // We don't match
        vm.canEdit = false;
      }
    }
  });

  var randomDuration = function() {
    return Math.floor(randomService.random() * 20.0) + 15;
  };

  vm.addMove = function() {
    vm.inserted = {
      move: null,
      duration: randomDuration(),
      isNew: true
    };
    
    vm.moveList.push(vm.inserted);
  };

  vm.updateMove = function(index, $data) {
    vm.moveList[index].move = $data;
    vm.moveList[index].isNew = false;
  };

  vm.removeMove = function(index, onlyNew) {
    if (!onlyNew || vm.moveList[index].isNew) {
      vm.moveList.splice(index, 1);
    }
  };

  vm.randomMove = function() {
    var moveEntry = {
      move: randomService.choose(vm.allMoves),
      duration: randomDuration()
    };
    vm.moveList.push(moveEntry);
  };

  vm.checkName = function($data) {
    if (!$data) {
      return 'Name is required';
    }

    if ($data.length <= 3) {
      return 'Name should be longer than three characters';
    }

    return true;
  };

  vm.checkMove = function($data) {
    if (!$data) {
      return 'No move specified';
    }

    if (!_.find(vm.allMoves, function(move) {
      return move.id === $data.id;
    })) {
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
        move: entry.move.id,
        duration: entry.duration
      });
    });
    
    var saveFailure = function() {
      flash.error = 'There was an issue saving your flow. Correct any issues and re-submit';
    };

    if (vm.flow.id) {
      // Update an existing flow
      vm.flow.$update(vm.saveSuccess, saveFailure);
    } else {
      vm.flow.$save(vm.saveSuccess, saveFailure);
    }
  };
};

var floweditor = function() {
  return {
    restrict: 'E',
    scope: {
      flow: '=',
      saveSuccess: '&onSaveSuccess',
      isCreating: '='
    },
    templateUrl: 'app/flow/edit/flow-editor.html',
    controller: 'FlowEditDirectiveController',
    controllerAs: 'vm',
    bindToController: true
  };
};

angular.module('acromaster.directives')
  .controller('FlowEditDirectiveController', ['$scope','_', 'Moves', 'flash', 'RandomService', 'AuthService', FlowEditDirectiveController])
  .directive('floweditor', floweditor);
