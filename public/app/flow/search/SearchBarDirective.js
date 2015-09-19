'use strict';

var SearchBarDirectiveController = function($location) {
  var vm = this;
  vm.scrollPoint = vm.scrollPoint || '+10000000';

  vm.search = function() {
    $location.path('/flows/results').search({search_query: vm.searchQuery});
  };
};

var searchbar = function() {
  return {
    restrict: 'E',
    scope: {
      randomFlow: '@',
      scrollPoint: '@',
      searchQuery: '='
    },
    templateUrl: 'app/flow/search/search-bar.html',
    controller: 'SearchBarDirectiveController',
    controllerAs: 'searchbar',
    bindToController: true
  };
};

angular.module('acromaster.directives')
  .controller('SearchBarDirectiveController', ['$location', SearchBarDirectiveController])
  .directive('searchbar', searchbar);
