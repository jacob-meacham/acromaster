'use strict';

// TODO: DRY, in a nicer way
var populateProfile = function (vm, User, userId, success) {
  vm.username = userId;
  var _populateProfile = function() {
    vm.profile = User.get({userId: userId}, success, function(response) {
      if (response.status === 404) {
        vm.flash.error = 'That user does not exist.';
        vm.profileError = true;
      }
    });
  };

  _populateProfile();

  vm.retryPopulateProfile = function() {
    vm.flash.error = false;
    vm.profileError = false;
    _populateProfile();
  };
};

var ProfileHomeController = function($routeParams, $timeout, flash, rand, User, pageHeaderService, _) {
  var vm = this;
  vm.flash = flash;
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

  populateProfile(vm, User, $routeParams.user, function() {
    vm.contentReady = true;
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
  }, function(response) {
    if (response.status === 404) {
      vm.error = 'That user does not exist.';
    } else {
      vm.error = response.statusText;
    }
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

var ProfileFlowsController = function($routeParams, $scope, flash, User, pageHeaderService, _) {
  var vm = this;
  vm.flash = flash;
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

  populateProfile(vm, User, $routeParams.user, function() {});

  // TODO: Don't need to do this work if there is no user.
  vm.allResults = User.getFlows({userId: $routeParams.user});
  vm.allResults.$promise.then(function() {
    vm.contentReady = true;
    vm.flows = filterFlows(_, vm.allResults.flows, vm.includeWorkouts);
  });
};

var ProfileFavoritesController = function($routeParams, flash, User, pageHeaderService) {
  var vm = this;
  vm.flash = flash;
  vm.templateUrl = 'app/profile/profile-favorites.html';
  populateProfile(vm, User, $routeParams.user, function() {});
  vm.favorites = User.getFavorites({userId: $routeParams.user}, function() {
    vm.contentReady = true;
  }); // TODO: Handle this more nicely (Instead of having to do favorites.flows...)
  pageHeaderService.setTitle($routeParams.user);
};

var ProfileAchievementsController = function($routeParams, $modal, flash, User, pageHeaderService, achievementsService) {
  var vm = this;
  vm.flash = flash;
  vm.templateUrl = 'app/profile/profile-achievements.html';
  pageHeaderService.setTitle($routeParams.user);

  populateProfile(vm, User, $routeParams.user, function() {
    vm.contentReady = true;
    vm.achievements = achievementsService.getUserAchievements(vm.profile);
  });

  vm.openAchievementDescriptionModal = function(description) {
    $modal.open({
      template: '<div class="achievement-description-modal">' + description + '</div>',
      size: 'sm',
      backdrop: true
    });
  };
};

angular.module('acromaster.controllers')
  .controller('ProfileHomeController', ['$routeParams', '$timeout', 'flash', 'RandomService', 'User', 'PageHeaderService', '_', ProfileHomeController])
  .controller('ProfileFlowsController', ['$routeParams', '$scope', 'flash', 'User', 'PageHeaderService', '_', ProfileFlowsController])
  .controller('ProfileFavoritesController', ['$routeParams', 'flash', 'User', 'PageHeaderService', ProfileFavoritesController])
  .controller('ProfileAchievementsController', ['$routeParams', '$modal', 'flash', 'User', 'PageHeaderService', 'AchievementsService', ProfileAchievementsController]);
