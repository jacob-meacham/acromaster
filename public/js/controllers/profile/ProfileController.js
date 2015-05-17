'use strict';

var setupPagination = function(vm, $http, type, userid) {
  // TODO: Into a service we go!
  vm.flows = $http.get('/api/profile/' + userid + '/' + type);
  vm.perPage = 25;
};

var ProfileHomeController = function($routeParams, User) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});
};

var ProfileStatsController = function($routeParams, User) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});
};

var ProfileFlowsController = function($routeParams, User, $http) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});

  setupPagination(vm, $http, 'flows', $routeParams.user);
};

var ProfileFavoritesController = function($routeParams, User, $http) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});

  setupPagination(vm, $http, 'favorites', $routeParams.user);
};

var ProfileAchievementsController = function($routeParams, User) {
  var vm = this;
  vm.profile = User.get({userId: $routeParams.user});
};

angular.module('acromaster.controllers')
  .controller('ProfileHomeController', ['$routeParams', 'User', ProfileHomeController])
  .controller('ProfileStatsController', ['$routeParams', 'User', ProfileStatsController])
  .controller('ProfileFlowsController', ['$routeParams', 'User', '$http', ProfileFlowsController])
  .controller('ProfileFavoritesController', ['$routeParams', 'User', '$http', ProfileFavoritesController])
  .controller('ProfileAchievementsController', ['$routeParams', 'User', ProfileAchievementsController]);
