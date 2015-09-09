/*global FastClick */
'use strict';

var app = angular.module('acromaster', [
  'ngAnimate',
  'ngRoute',
  'ngCookies',
  'ngSanitize',
  'acromaster.services',
  'acromaster.controllers',
  'acromaster.directives',
  'ui.bootstrap',
  'ui.scrollpoint',
  'xeditable',
  'rzModule',
  'ngJustGage',
  'nsPopover',
  'slick',
  'angular-flash.service',
  'angular-flash.flash-alert-directive',
  'angularUtils.directives.dirPagination',
  'base64'
])
.run(['editableOptions', function(editableOptions) {
  FastClick.attach(document.body);
  editableOptions.theme = 'bs3';
}]);

// Pre-define modules
angular.module('acromaster.services', ['ngResource']);
angular.module('acromaster.controllers', []);
angular.module('acromaster.directives', []);

app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('httpErrorsInterceptor');
  }])
  .config(['flashProvider', function(flashProvider) {
    flashProvider.errorClassnames.push('alert-danger');
  }])
  .config(['$routeProvider', '$locationProvider', '$sceDelegateProvider', function($routeProvider, $locationProvider, $sceDelegateProvider) {
    $routeProvider.
    when('/', {
      templateUrl: '/app/home/home.html',
      controller: 'HomeController',
      controllerAs: 'vm'
    })
    .when('/login', {
      templateUrl: '/app/login/login.html'
    })
    .when('/signup', {
      templateUrl: '/app/login/login.html'
    })
    .when('/about', {
      templateUrl: '/app/about/about.html',
      controller: 'AboutController',
      controllerAs: 'vm'
    })
    .when('/washing-machine', {
      templateUrl: '/app/washing-machine/washing-machine.html',
      controller: 'WashingMachineViewController',
      controllerAs: 'vm'
    })
    .when('/flows', {
      templateUrl: '/app/flow//home/flow-home.html',
      controller: 'FlowHomeController',
      controllerAs: 'vm'
    })
    .when('/flows/results', {
      templateUrl: '/app/flow/search/flow-search-results.html',
      controller: 'FlowSearchResultsController',
      controllerAs: 'vm',
      resolve: {
        flows: ['FlowSearchInitialData', function(FlowSearchInitialData) {
          return FlowSearchInitialData.performSearch().catch(function() {
            return { success: false };
          });
        }]
      }
    })
    .when('/flow/create', {
      templateUrl: '/app/flow/create/flow-create.html',
      controller: 'FlowCreateController',
      controllerAs: 'vm'
    })
    .when('/flow/:flowId/remix', {
      templateUrl: '/app/flow/create/flow-create.html',
      controller: 'FlowCreateController',
      controllerAs: 'vm'
    })
    .when('/flow/workout', {
      templateUrl: '/app/workout/workout.html',
      controller: 'QuickPlayController',
      controllerAs: 'vm'
    })
    .when('/flow/end', {
      templateUrl: '/app/flow/play/end/flow-end.html',
      controller: 'FlowEndController',
      controllerAs: 'vm'
    })
    .when('/flow/:flowId/edit', {
      templateUrl: '/app/flow/edit/flow-edit.html',
      controller: 'FlowEditController',
      controllerAs: 'vm'
    })
    .when('/flow/:flowId', {
      templateUrl: '/app/flow/view/flow-view.html',
      controller: 'FlowViewController',
      controllerAs: 'vm'
    })
    .when('/flow/:flowId/play', {
      templateUrl: '/app/flow/play/flow-play.html',
      controller: 'FlowPlayController',
      controllerAs: 'vm'
    })
    .when('/profile/:user', {
      templateUrl: '/app/profile/profile-container.html',
      controller: 'ProfileHomeController',
      controllerAs: 'vm'
    })
    .when('/profile/:user/favorites', {
      templateUrl: '/app/profile/profile-container.html',
      controller: 'ProfileFavoritesController',
      controllerAs: 'vm'
    })
    .when('/profile/:user/flows', {
      templateUrl: '/app/profile/profile-container.html',
      controller: 'ProfileFlowsController',
      controllerAs: 'vm'
    })
    .when('/profile/:user/achievements', {
      templateUrl: '/app/profile/profile-container.html',
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
