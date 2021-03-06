'use strict';

// This class is used to keep audio playing on mobile devices at all times by switching between an empty sound and the audio we want.
var LoopedAudio = function(tweenAudioSrcPromise) {
  
  var mainAudio = new Audio();
  var tweenAudio = new Audio();
  var isTween = false;
  var isInitialized = false;

  tweenAudioSrcPromise.then(function(src) {
    tweenAudio.src = src;
    tweenAudio.loop = true;
  });

  mainAudio.addEventListener('ended', function() {
    // The current sound ended, so let's set the in-between sound to keep mobile devices from shutting off.
    tweenAudio.play();
    isTween = true;
  });

  var play = function() {
    if (isTween) {
      tweenAudio.play();
    } else {
      mainAudio.play();
    }
  };

  var pause = function() {
    if (isTween) {
      tweenAudio.pause();
    } else {
      mainAudio.pause();
    }
  };

  var setAudio = function(file) {
    if (!isInitialized) {
      // All audio must be started by user gesture...
      isInitialized = true;
      tweenAudio.play();
    }
    
    tweenAudio.pause();
    mainAudio.src = file;
    mainAudio.play();
    isTween = false;
  };

  var setVolume = function(volume) {
    tweenAudio.volume = volume;
    mainAudio.volume = volume;
  };

  var destroy = function() {
    mainAudio.pause();
    tweenAudio.pause();
  };

  return {
    play: play,
    pause: pause,
    setAudio: setAudio,
    setVolume: setVolume,
    destroy: destroy,
    __mainAudio: mainAudio,
    __tweenAudio: tweenAudio
  };
};

var FlowPlayerDirectiveController = function($scope, $interval, sounds) {
  var vm = this;

  var audio = vm.audio = new LoopedAudio(sounds.getSilence());
  var currentEntry = {};
  vm.currentMove = {};
  vm.currentMoveIdx = 0;
  vm.hasStarted = false;
  vm.paused = false;

  var scaledDuration;
  vm.timeRemaining = 0;
  vm.speedMultiplier = 1;
  vm.volume = 100;
  vm.muted = false;

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

  vm.toggleMute = function() {
    vm.muted = !vm.muted;
    if (vm.muted) {
      vm.oldVolume = vm.volume;
      vm.volume = 0;
    } else {
      vm.volume = vm.oldVolume;
    }
  };

  vm.volumeSlideStarted = function() {
    vm.oldVolume = vm.volume;
  };

  vm.setAudio = function(file) {
    audio.setAudio(file);
  };

  $scope.$watch(function() { return vm.volume; }, function(newVal) {
    audio.setVolume(newVal / 100.0);
    if (newVal === 0) {
      vm.muted = true;
    } else {
      vm.muted = false;
    }
  });

  var getScaledDuration = function(duration, multiplier) {
    if (multiplier <= 0) {
      multiplier = 1;
    }

    return duration * (1.0/multiplier);
  };

  vm.updateDuration = function() {
    if (vm.timeRemaining < 4000) {
      // Too close to the end of the move - don't update the duration.
      return;
    }

    var newScaledDuration = getScaledDuration(currentEntry.duration, vm.speedMultiplier);
    vm.timeRemaining = newScaledDuration * vm.timeRemaining / scaledDuration;
    scaledDuration = newScaledDuration;
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
    currentEntry.visible = false;
    if (entryIndex >= vm.flow.moves.length) {
      return finishFlow();
    }
    
    currentEntry = vm.flow.moves[entryIndex];
    currentEntry.visible = true;
    
    vm.currentMove = currentEntry.move;
    vm.currentMoveIdx = entryIndex;
    vm.setAudio(currentEntry.move.audioUri);
 
    scaledDuration = getScaledDuration(currentEntry.duration, vm.speedMultiplier);
    vm.timeRemaining = scaledDuration * 1000;
    startTimer(1000);
  };

  var finishFlow = function() {
    sounds.getDoneSound().then(function(doneSound) {
      vm.setAudio(doneSound);
    });

    intervalPromise = $interval(vm.onFlowEnd, 3000);
  };

  $scope.$on('$destroy', function() {
    cancelTimer();
    audio.destroy();
  });
};

var flowplayer = function() {
  return {
    restrict: 'E',
    scope: {
      flow: '=',
      onFlowEnd: '&'
    },
    templateUrl: 'app/flow/play/flow-player.html',
    controller: 'FlowPlayerDirectiveController',
    controllerAs: 'player',
    bindToController: true
  };
};

angular.module('acromaster.directives')
  .controller('FlowPlayerDirectiveController', ['$scope', '$interval', 'SoundService', FlowPlayerDirectiveController])
  .directive('flowplayer', flowplayer);