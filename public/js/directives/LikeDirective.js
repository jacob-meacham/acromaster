'use strict';

var directives = angular.module('acromaster.directives');

directives.controller('LikeDirectiveController', ['Flow', function(Flow) {
  var vm = this;

  var getAction = function() {
    if (vm.hasLiked) {
      return 'Unlike';
    } else {
      return 'Like';
    }
  };

  vm.flow.$promise.then(function() {
    Flow.hasLiked({ flowId: vm.flow.id }, function(response) {
      vm.hasLiked = response.hasLiked;
      vm.action = getAction();
    });

    vm.likeCount = vm.flow.likes;
  });

  vm.toggleLike = function() {
    if (vm.hasLiked) {
      vm.likeCount -= 1;
      vm.hasLiked = false;
      Flow.unlike({ flowId: vm.flow.id });
    } else {
      vm.likeCount += 1;
      vm.hasLiked = true;
      Flow.like({ flowId: vm.flow.id }, {});
    }

    vm.action = getAction();
  };
}]);
directives.directive('flowLike', [function() {
  return {
    restrict: 'E',
    templateUrl: 'partials/flow/flow_like.html',
    controller: 'LikeDirectiveController',
    controllerAs: 'vm',
    bindToController: true,
    scope: {
      flow: '='
    }
  };
}]);