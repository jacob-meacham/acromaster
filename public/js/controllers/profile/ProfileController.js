'use strict';

var ProfileHomeController = function($routeParams, $timeout, $window, rand, User, pageHeaderService, _) {
  var vm = this;
  pageHeaderService.setTitle($routeParams.user);

  var commonOptions = {
    value: 0,
    gaugeWidthScale: 0.2,
    donut: true,
    relativeGaugeSize: true,
    valueFontColor: '#fff',
    titleFontColor: '#fff',
    gaugeColor: '#00000000',
    counter: false,
    donutStartAngle: 270,
    title: ''
  };

  vm.minutesPlayedOptions = {};
  vm.movesPlayedOptions = {};

  vm.flowsPlayedOptions = _.merge({
    min: 0,
    max: 100,
    levelColors: ['#CE1B21'],
    textRenderer: function() {
      return '\uf0e7';
    }
  }, commonOptions);

  vm.minutesPlayedOptions = _.merge({
    min: 0,
    max: 2000,
    levelColors: ['#00FF00'],
    textRenderer: function() {
      return '\uf017';
    }
  }, commonOptions);

  vm.movesPlayedOptions = _.merge({
    min: 0,
    max: 1000,
    levelColors: ['#FFFF00'],
    textRenderer: function() {
      return '\uf06d';
    }
  }, commonOptions);

  vm.profile = User.get({userId: $routeParams.user});
  vm.profile.$promise.then(function() {
    var stats = vm.profile.stats;
    vm.flowsPlayedOptions.max = $window.Math.max(vm.flowsPlayedOptions.max, stats.flowsPlayed / (1.5 + rand.random()));
    vm.minutesPlayedOptions.max = $window.Math.max(vm.minutesPlayedOptions.max, stats.minutesPlayed / (1.5 + rand.random()));
    vm.movesPlayedOptions.max = $window.Math.max(vm.movesPlayedOptions.max, stats.moves / (1.5 + rand.random()));

    $timeout(function() {
      vm.flowsPlayedOptions.value = stats.flowsPlayed;
    }, 800);

    $timeout(function() {
      vm.minutesPlayedOptions.value = stats.minutesPlayed;
    }, 1000);

    $timeout(function() {
      vm.movesPlayedOptions.value = stats.moves;
    }, 1200);
  });
};

var ProfileFlowsController = function($routeParams, User, pageHeaderService) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});
  vm.flows = User.getFlows({userId: $routeParams.user});
  vm.perPage = 25;
  pageHeaderService.setTitle($routeParams.user);
};

var ProfileFavoritesController = function($routeParams, User, pageHeaderService) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});
  vm.flows = User.getFavorites({userId: $routeParams.user});
  vm.perPage = 25;
  pageHeaderService.setTitle($routeParams.user);
};

var ProfileAchievementsController = function($routeParams, User, pageHeaderService) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});
  pageHeaderService.setTitle($routeParams.user);
};

angular.module('acromaster.controllers')
  .controller('ProfileHomeController', ['$routeParams', '$timeout', '$window', 'RandomService', 'User', 'PageHeaderService', '_', ProfileHomeController])
  .controller('ProfileFlowsController', ['$routeParams', 'User', 'PageHeaderService', ProfileFlowsController])
  .controller('ProfileFavoritesController', ['$routeParams', 'User', 'PageHeaderService', ProfileFavoritesController])
  .controller('ProfileAchievementsController', ['$routeParams', 'User', 'PageHeaderService', ProfileAchievementsController]);
