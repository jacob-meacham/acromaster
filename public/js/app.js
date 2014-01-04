'use strict';

var app = angular.module('acromaster', [
  'ngRoute',
  'acromaster.services',
  'acromaster.controllers',
  'ui.slider'
]);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider.
    when('/flow/quick', {
      templateUrl: '/partials/flow/quick.html',
      controller: 'QuickPlayCreateController'
    }).
    when('/flow/quick/play', {
      templateUrl: '/partials/flow/play.html',
      controller: 'FlowPlayController'
    }).
    otherwise({
      redirectTo: '/flow/quick'
    });

    $locationProvider.html5Mode(true);
  }
);