/*global FastClick */
'use strict';

var app = angular.module('acromaster', [
  'ngAnimate',
  'ngRoute',
  'acromaster.services',
  'acromaster.controllers',
  'acromaster.directives',
  'xeditable',
  'vr.directives.slider',
  'ui.bootstrap',
  'ui.sortable',
  'ngJustGage',
  'nsPopover',
  'angular-flash.service',
  'angular-flash.flash-alert-directive'
])
.run(function() {
  FastClick.attach(document.body);
});

// Pre-define modules
angular.module('acromaster.services', ['ngResource']);
angular.module('acromaster.controllers', []);
angular.module('acromaster.directives', []);

app.config(['$routeProvider', '$locationProvider', '$sceDelegateProvider', function($routeProvider, $locationProvider, $sceDelegateProvider) {
    $routeProvider.
    when('/', {
      templateUrl: '/partials/index.html'
    })
    .when('/login', {
      templateUrl: '/partials/login.html'
    })
    .when('/about', {
      templateUrl: '/partials/about.html',
      controller: 'AboutController'
    })
    .when('/washing-machine', {
      templateUrl: '/partials/washing-machine/view.html',
      controller: 'WashingMachineViewController'
    })
    .when('/flows', {
      templateUrl: '/partials/flow/home.html',
      controller: 'FlowHomeController'
    })
    .when('/flows/results', {
      templateUrl: '/partials/flow/search_results.html',
      controller: 'FlowSearchResultsController',
      resolve: {
        flows: function(FlowSearchInitialData) {
          return FlowSearchInitialData.performSearch();
        }
      }
    })
    .when('/flow/create', {
      templateUrl: '/partials/flow/create.html',
      controller: 'FlowCreateController'
    })
    .when('/flow/:flowId/remix', {
      templateUrl: '/partials/flow/create.html',
      controller: 'FlowCreateController'
    })
    .when('/flow/workout', {
      templateUrl: '/partials/flow/play/workout.html',
      controller: 'WorkoutCreateController'
    })
    .when('/flow/end', {
      templateUrl: '/partials/flow/play/end.html',
      controller: 'FlowEndController'
    })
    .when('/flow/:flowId/edit', {
      templateUrl: '/partials/flow/edit.html',
      controller: 'FlowEditController'
    })
    .when('/flow/:flowId', {
      templateUrl: '/partials/flow/view.html',
      controller: 'FlowViewController'
    })
    .when('/flow/:flowId/play', {
      templateUrl: '/partials/flow/play/play.html',
      controller: 'FlowPlayController'
    })
    .when('/profile/:user', {
      templateUrl: '/partials/profile/home.html',
      controller: 'ProfileHomeController'
    })
    .when('/profile/:user/favorites', {
      templateUrl: '/partials/profile/favorites.html',
      controller: 'ProfileFavoritesController'
    })
    .when('/profile/:user/flows', {
      templateUrl: '/partials/profile/flows.html',
      controller: 'ProfileFlowsController'
    })
    .when('/profile/:user/achievements', {
      templateUrl: '/partials/profile/achievement.html',
      controller: 'ProfileAchievementsController'
    })
    .otherwise({
      redirectTo: '/'
    });

    $locationProvider.html5Mode(true);

    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http://localhost**',
      'http://acromaster.s3.amazonaws.com/**']);
  }]);
