'use strict';

var app = angular.module('acromaster', [
  'ngAnimate',
  'ngRoute',
  'acromaster.services',
  'acromaster.controllers',
  'ui.slider',
  'ui.bootstrap'
]);

app.config(function($routeProvider, $locationProvider, $sceDelegateProvider) {
    $routeProvider.
    when('/', {
      templateUrl: '/partials/index.html'
    })
    .when('/washing-machine', {
      templateUrl: '/partials/washing-machine/view.html',
      controller: 'WashingMachineViewController'
    })
    .when('/flows', {
      templateUrl: '/partials/flow/list.html',
      controller: 'FlowListController'
    })
    .when('/flow/create', {
      templateUrl: '/partials/flow/create.html',
      controller: 'FlowCreateController'
    })
    .when('/flow/quick', {
      templateUrl: '/partials/flow/quick.html',
      controller: 'QuickPlayCreateController'
    })
    .when('/flow/quick/play', {
      templateUrl: '/partials/flow/play.html',
      controller: 'FlowPlayController'
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
      templateUrl: '/partials/flow/play.html',
      controller: 'FlowPlayController'
    })
    .otherwise({
      redirectTo: '/'
    });

    $locationProvider.html5Mode(true);

    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http://localhost**',
      'http://acromaster.s3.amazonaws.com/**']);
  }
);