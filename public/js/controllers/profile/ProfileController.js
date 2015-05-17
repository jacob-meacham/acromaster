'use strict';

var setupPagination = function($scope, $http, type, userid) {
  // TODO: Into a service we go!
  $scope.flows = $http.get('/api/profile/' + userid + '/' + type);
  $scope.perPage = 25;
};

var ProfileHomeController = function($scope, $routeParams, User) {
  $scope.profile = User.get({userId: $routeParams.user});
};

var ProfileStatsController = function($scope, $routeParams, User) {
  $scope.profile = User.get({userId: $routeParams.user});
};

var ProfileFlowsController = function($scope, $routeParams, User, $http) {
  $scope.profile = User.get({userId: $routeParams.user});

  setupPagination($scope, $http, 'flows', $routeParams.user);
};

var ProfileFavoritesController = function($scope, $routeParams, User, $http) {
  $scope.profile = User.get({userId: $routeParams.user});

  setupPagination($scope, $http, 'favorites', $routeParams.user);
};

var ProfileAchievementsController = function($scope, $routeParams, User) {
  $scope.profile = User.get({userId: $routeParams.user});
};

var acromasterControllers = angular.module('acromaster.controllers');
acromasterControllers.controller('ProfileHomeController', ['$scope', '$routeParams', 'User', ProfileHomeController]);
acromasterControllers.controller('ProfileStatsController', ['$scope', '$routeParams', 'User', ProfileStatsController]);
acromasterControllers.controller('ProfileFlowsController', ['$scope', '$routeParams', 'User', '$http', ProfileFlowsController]);
acromasterControllers.controller('ProfileFavoritesController', ['$scope', '$routeParams', 'User', '$http', ProfileFavoritesController]);
acromasterControllers.controller('ProfileAchievementsController', ['$scope', '$routeParams', 'User', ProfileAchievementsController]);
