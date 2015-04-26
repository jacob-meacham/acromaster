'use strict';

// TODO: Caching of profile?
var acromasterControllers = angular.module('acromaster.controllers');

acromasterControllers.controller('ProfileHomeController', ['$scope', '$routeParams', 'User', function($scope, $routeParams, User) {
  $scope.profile = User.get({userId: $routeParams.user});
}]);

acromasterControllers.controller('ProfileStatsController', ['$scope', '$routeParams', 'User', function($scope, $routeParams, User) {
  $scope.profile = User.get({userId: $routeParams.user});
}]);

var setupPagination = function($scope, $http, type, userid) {
  // TODO: Into a service we go!
  $scope.flows = $http.get('/api/profile/' + userid + '/' + type);
  $scope.perPage = 25;
};

acromasterControllers.controller('ProfileFlowsController', ['$scope', '$routeParams', 'User', '$http', function($scope, $routeParams, User, $http) {
  $scope.profile = User.get({userId: $routeParams.user});

  setupPagination($scope, $http, 'flows', $routeParams.user);
  
}]);

acromasterControllers.controller('ProfileFavoritesController', ['$scope', '$routeParams', 'User', '$http', function($scope, $routeParams, User, $http) {
  $scope.profile = User.get({userId: $routeParams.user});

  setupPagination($scope, $http, 'favorites', $routeParams.user);
}]);

acromasterControllers.controller('ProfileAchievementsController', ['$scope', '$routeParams', 'User', function($scope, $routeParams, User) {
  $scope.profile = User.get({userId: $routeParams.user});
}]);
