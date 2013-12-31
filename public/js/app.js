'use strict';

angular.module('acromaster', [
  'acromaster.controllers'
]);

angular.module('acromaster').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/list/create', {
      templateUrl: 'partials/list/create.html',
      controller: 'ListController'
    }).
    when('/', {
      templateUrl: 'partials/index.html',
      controller: 'IndexController'
    }).
    otherwise({
      redirectTo: '/'
    });
  }
]);