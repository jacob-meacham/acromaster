'use strict';

angular.module('acromaster.directives')
.controller('FlowPlayerDirectiveController', ['$scope', '$interval', function($scope, $interval) {
  var vm = this;

  var audio = vm.audio = new Audio();
  var currentEntry = {};
  vm.currentMove = {};
  vm.hasStarted = false;

  vm.start = function() {
    vm.hasStarted = true;
    vm.flow.$promise.then(function() {
      angular.forEach(vm.flow.moves, function(entry) {
        entry.visible = false;
      });

      nextMove(0);
    });
  };

  vm.play = function() {
    audio.play();
  };

  vm.pause = function() {
    audio.pause();
  };

  vm.setAudio = function(file) {
    audio.src = file;
    audio.play();
  };

  var intervalPromise;
  var nextMove = function(entryIndex) {
    if (currentEntry) {
      currentEntry.visible = false;
    }
 
    if (entryIndex >= vm.flow.moves.length) {
      vm.onFlowEnd();
    }
    
    currentEntry = vm.flow.moves[entryIndex];
    currentEntry.visible = true;
    
    vm.currentMove = currentEntry.move;
    vm.setAudio(currentEntry.move.audioUri);
 
    intervalPromise = $interval(function() {
      nextMove(entryIndex+1); }, currentEntry.duration * 1000, 1);
  };

  $scope.$on('$destroy', function() {
    if (angular.isDefined(intervalPromise)) {
      $interval.cancel(intervalPromise);
      intervalPromise = undefined;
    }
  });
}])
.directive('flowplayer', function() {
  return {
    restrict: 'E',
    scope: {
      flow: '=',
      onFlowEnd: '&'
    },
    link: function($scope) {
     $scope.$on('flow-play', function () {
        $scope.play();
      });

      $scope.$on('flow-pause', function () {
        $scope.pause();
      });

      $scope.$on('flow-set', function(event, file) {
        $scope.setAudio(file);
      });
    },
    templateUrl: 'partials/flow/play/flowplayer.html',
    controller: 'FlowPlayerDirectiveController',
    controllerAs: 'vm',
    bindToController: true
  };
});