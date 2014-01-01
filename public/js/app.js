'use strict';

var app = angular.module('acromaster', [
  'ngRoute',
  'acromaster.services',
  'acromaster.controllers'
]);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider.
    when('/flow/quick', {
      templateUrl: '/partials/flow/quick.html',
      controller: 'QuickCreateController'
    }).
    otherwise({
      redirectTo: '/flow/quick'
    });

    $locationProvider.html5Mode(true);
  }
);