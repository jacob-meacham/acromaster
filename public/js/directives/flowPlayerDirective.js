'use strict';

var directives = angular.module('acromaster.directives');

directives.directive('flowplayer', function() {
  return {
    restrict: 'E',
    scope: {},
    link: function($scope) {
     $scope.$on('flow-play', function () {
        $scope.play();
      });

      $scope.$on('flow-pause', function () {
        $scope.pause();
      });

      $scope.$on('flow-set', function(event, file) {
        console.log('on!' + file);
        $scope.setAudio(file);
      });
    },
    controller: ['$scope' , function($scope) {
      var audio = $scope.audio = new Audio();

      $scope.play = function() {
        audio.play();
      };

      $scope.pause = function() {
        audio.pause();
      };

      $scope.setAudio = function(file) {
        audio.src = file;
        audio.play();
      };
    }]
  };
});