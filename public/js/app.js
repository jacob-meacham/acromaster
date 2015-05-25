/*global FastClick */
'use strict';

var app = angular.module('acromaster', [
  'ngAnimate',
  'ngRoute',
  'ngCookies',
  'acromaster.services',
  'acromaster.controllers',
  'acromaster.directives',
  'xeditable',
  'vr.directives.slider',
  'ui.bootstrap',
  'ui.sortable',
  'ngJustGage',
  'nsPopover',
  'slick',
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
      templateUrl: '/partials/index.html',
      controller: 'HomeController',
      controllerAs: 'vm'
    })
    .when('/login', {
      templateUrl: '/partials/login.html'
    })
    .when('/about', {
      templateUrl: '/partials/about.html',
      controller: 'AboutController',
      controllerAs: 'vm'
    })
    .when('/washing-machine', {
      templateUrl: '/partials/washing-machine/view.html',
      controller: 'WashingMachineViewController',
      controllerAs: 'vm'
    })
    .when('/flows', {
      templateUrl: '/partials/flow/home.html',
      controller: 'FlowHomeController',
      controllerAs: 'vm'
    })
    .when('/flows/results', {
      templateUrl: '/partials/flow/search_results.html',
      controller: 'FlowSearchResultsController',
      controllerAs: 'vm',
      resolve: {
        flows: function(FlowSearchInitialData) {
          return FlowSearchInitialData.performSearch();
        }
      }
    })
    .when('/flow/create', {
      templateUrl: '/partials/flow/create.html',
      controller: 'FlowCreateController',
      controllerAs: 'vm'
    })
    .when('/flow/:flowId/remix', {
      templateUrl: '/partials/flow/create.html',
      controller: 'FlowCreateController',
      controllerAs: 'vm'
    })
    .when('/flow/workout', {
      templateUrl: '/partials/flow/play/workout.html',
      controller: 'WorkoutCreateController',
      controllerAs: 'vm'
    })
    .when('/flow/end', {
      templateUrl: '/partials/flow/play/end.html',
      controller: 'FlowEndController',
      controllerAs: 'vm'
    })
    .when('/flow/:flowId/edit', {
      templateUrl: '/partials/flow/edit.html',
      controller: 'FlowEditController',
      controllerAs: 'vm'
    })
    .when('/flow/:flowId', {
      templateUrl: '/partials/flow/view.html',
      controller: 'FlowViewController',
      controllerAs: 'vm'
    })
    .when('/flow/:flowId/play', {
      templateUrl: '/partials/flow/play/play.html',
      controller: 'FlowPlayController',
      controllerAs: 'vm'
    })
    .when('/profile/:user', {
      templateUrl: '/partials/profile/home.html',
      controller: 'ProfileHomeController',
      controllerAs: 'vm'
    })
    .when('/profile/:user/favorites', {
      templateUrl: '/partials/profile/favorites.html',
      controller: 'ProfileFavoritesController',
      controllerAs: 'vm'
    })
    .when('/profile/:user/flows', {
      templateUrl: '/partials/profile/flows.html',
      controller: 'ProfileFlowsController',
      controllerAs: 'vm'
    })
    .when('/profile/:user/achievements', {
      templateUrl: '/partials/profile/achievements.html',
      controller: 'ProfileAchievementsController',
      controllerAs: 'vm'
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
