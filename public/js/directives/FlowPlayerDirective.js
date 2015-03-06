'use strict';

angular.module('acromaster.directives')
.controller('FlowPlayerDirectiveController', ['$scope', '$interval', function($scope, $interval) {
  var vm = this;

  var audio = vm.audio = new Audio();
  var currentEntry = {};
  vm.currentMove = {};
  vm.currentMoveIdx = 0;
  vm.hasStarted = false;
  vm.timeRemaining = 0;
  vm.paused = false;

  if (!vm.flow || !vm.flow.$promise) {
    // No flow
    vm.onFlowEnd('no flow specified');
  }

  vm.start = function() {
    vm.hasStarted = true;
    vm.flow.$promise.then(function() {
      angular.forEach(vm.flow.moves, function(entry) {
        entry.visible = false;
      });

      nextMove(0);
    });
  };

  // TODO: Refactor the audio playing out into a separate directive
  vm.play = function() {
    audio.play();
    startTimer(1000);
    vm.paused = false;
  };

  vm.pause = function() {
    cancelTimer();
    audio.pause();
    vm.paused = true;
  };

  vm.setAudio = function(file) {
    audio.src = file;
    audio.play();
  };

  var intervalPromise;
  var startTimer = function(delay) {
    intervalPromise = $interval(function() {
      if (vm.timeRemaining > 0) {
        vm.timeRemaining -= delay;
        startTimer(delay);
      } else {
        nextMove(vm.currentMoveIdx + 1);
      }
    }, delay, 1);
  };

  var cancelTimer = function() {
    if (angular.isDefined(intervalPromise)) {
      $interval.cancel(intervalPromise);
      intervalPromise = undefined;
    }
  };

  var nextMove = function(entryIndex) {
    if (currentEntry) {
      currentEntry.visible = false;
    }
 
    if (entryIndex >= vm.flow.moves.length) {
      vm.onFlowEnd();
      return;
    }
    
    currentEntry = vm.flow.moves[entryIndex];
    currentEntry.visible = true;
    
    vm.currentMove = currentEntry.move;
    vm.currentMoveIdx = entryIndex;
    vm.setAudio(currentEntry.move.audioUri);
 
    vm.timeRemaining = currentEntry.duration * 1000;
    startTimer(1000);
  };

  $scope.$on('$destroy', function() {
    cancelTimer();
  });
}])
.directive('flowplayer', function() {
  return {
    restrict: 'E',
    scope: {
      flow: '=',
      onFlowEnd: '&'
    },
    templateUrl: 'partials/flow/play/flowplayer.html',
    controller: 'FlowPlayerDirectiveController',
    controllerAs: 'vm',
    bindToController: true
  };
});