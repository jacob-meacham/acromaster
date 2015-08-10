'use strict';

var ProfileHomeController = function($routeParams, $timeout, rand, User, pageHeaderService, _) {
  var vm = this;
  vm.templateUrl = 'app/profile/profile-home.html';
  pageHeaderService.setTitle($routeParams.user);

  var commonOptions = {
    value: 0,
    gaugeWidthScale: 0.3,
    donut: true,
    relativeGaugeSize: true,
    valueFontColor: '#333',
    titleFontColor: '#333',
    gaugeColor: '#00000000',
    counter: false,
    donutStartAngle: 270,
    title: '',
    min: 0
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
    var minutesPlayed = stats.secondsPlayed / 60;
    vm.flowsPlayedOptions.max = stats.flowsPlayed * (1.1 + (0.9 * rand.random()));
    vm.minutesPlayedOptions.max = minutesPlayed * (1.1 + (0.9 * rand.random()));
    vm.movesPlayedOptions.max = stats.moves * (1.1 + (0.9 * rand.random()));

    $timeout(function() {
      vm.flowsPlayedOptions.value = stats.flowsPlayed;
    }, 800);

    $timeout(function() {
      vm.minutesPlayedOptions.value = minutesPlayed;
    }, 1000);

    $timeout(function() {
      vm.movesPlayedOptions.value = stats.moves;
    }, 1200);
  });
};

// TODO: Make a FlowFilterService
var filterFlows = function(_, flows, includeWorkouts) {
  if (includeWorkouts) {
    return flows;
  } else {
    return _.filter(flows, function(flow) {
      return !flow.workout;
    });
  }
};

var ProfileFlowsController = function($routeParams, $scope, User, pageHeaderService, _) {
  var vm = this;
  vm.templateUrl = 'app/profile/profile-flows.html';
  pageHeaderService.setTitle($routeParams.user);

  vm.includeWorkouts = false;
  $scope.$watch(function() {
      return vm.includeWorkouts;
    }, function() {
      // TODO: Reload from server? Do something else more interesting?
      vm.flows = filterFlows(_, vm.allResults.flows, vm.includeWorkouts);
    }
  );

  vm.profile = User.get({userId: $routeParams.user});
  vm.allResults = User.getFlows({userId: $routeParams.user});
  vm.allResults.$promise.then(function() {
    vm.flows = filterFlows(_, vm.allResults.flows, vm.includeWorkouts);
  });
};

var ProfileFavoritesController = function($routeParams, User, pageHeaderService) {
  var vm = this;
  vm.templateUrl = 'app/profile/profile-favorites.html';
  vm.profile = User.get({userId: $routeParams.user});
  vm.flows = User.getFavorites({userId: $routeParams.user});
  vm.perPage = 25;
  pageHeaderService.setTitle($routeParams.user);
};

var ProfileAchievementsController = function($routeParams, User, pageHeaderService, achievementsService) {
  var vm = this;
  vm.templateUrl = 'app/profile/profile-achievements.html';
  pageHeaderService.setTitle($routeParams.user);

  vm.profile = User.get({userId: $routeParams.user});
  vm.profile.$promise.then(function() {
    vm.achievements = achievementsService.getUserAchievements(vm.profile);
  });
};

angular.module('acromaster.controllers')
  .controller('ProfileHomeController', ['$routeParams', '$timeout', 'RandomService', 'User', 'PageHeaderService', '_', ProfileHomeController])
  .controller('ProfileFlowsController', ['$routeParams', '$scope', 'User', 'PageHeaderService', '_', ProfileFlowsController])
  .controller('ProfileFavoritesController', ['$routeParams', 'User', 'PageHeaderService', ProfileFavoritesController])
  .controller('ProfileAchievementsController', ['$routeParams', 'User', 'PageHeaderService', 'AchievementsService', ProfileAchievementsController]);
