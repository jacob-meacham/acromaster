'use strict';

var ProfileHomeController = function($routeParams, User, pageHeaderService) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});
  pageHeaderService.setTitle($routeParams.user);
};

var ProfileStatsController = function($routeParams, User, pageHeaderService) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});
  pageHeaderService.setTitle($routeParams.user);
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
  .controller('ProfileHomeController', ['$routeParams', 'User', 'PageHeaderService', ProfileHomeController])
  .controller('ProfileStatsController', ['$routeParams', 'User', 'PageHeaderService', ProfileStatsController])
  .controller('ProfileFlowsController', ['$routeParams', 'User', 'PageHeaderService', ProfileFlowsController])
  .controller('ProfileFavoritesController', ['$routeParams', 'User', 'PageHeaderService', ProfileFavoritesController])
  .controller('ProfileAchievementsController', ['$routeParams', 'User', 'PageHeaderService', ProfileAchievementsController]);
