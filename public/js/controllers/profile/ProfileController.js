'use strict';

var ProfileHomeController = function($routeParams, User) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});
};

var ProfileStatsController = function($routeParams, User) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});
};

var ProfileFlowsController = function($routeParams, User) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});
  vm.flows = User.getFlows({userId: $routeParams.user});
  vm.perPage = 25;
};

var ProfileFavoritesController = function($routeParams, User) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});
  vm.flows = User.getFavorites({userId: $routeParams.user});
  vm.perPage = 25;
};

var ProfileAchievementsController = function($routeParams, User) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});
};

angular.module('acromaster.controllers')
  .controller('ProfileHomeController', ['$routeParams', 'User', ProfileHomeController])
  .controller('ProfileStatsController', ['$routeParams', 'User', ProfileStatsController])
  .controller('ProfileFlowsController', ['$routeParams', 'User', ProfileFlowsController])
  .controller('ProfileFavoritesController', ['$routeParams', 'User', ProfileFavoritesController])
  .controller('ProfileAchievementsController', ['$routeParams', 'User', ProfileAchievementsController]);
