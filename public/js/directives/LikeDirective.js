'use strict';

var LikeDirectiveController = function(Flow, authService, $cookieStore) {
  var vm = this;
  vm.hasLiked = false;

  // Doesn't need to be cryptographically secure
  var cookieHash = function() {
    return '__anon_' + Math.random().toString(36).substr(2);
  };

  var cookieAnonId = $cookieStore.get('acromasterAnonId');
  if (!cookieAnonId) {
    cookieAnonId = cookieHash();
    $cookieStore.put('acromasterAnonId', cookieAnonId);
  }

  var getAction = function() {
    if (vm.hasLiked) {
      return 'Unlike';
    } else {
      return 'Like';
    }
  };

  var addLike = function() {
    vm.likeCount += 1;
    vm.hasLiked = true;
    Flow.like({ flowId: vm.flow.id, anonId: cookieAnonId }, {});
  };

  var removeLike = function() {
    vm.likeCount -= 1;
    vm.hasLiked = false;
    Flow.unlike({ flowId: vm.flow.id, anonId: cookieAnonId });
  };

  vm.toggleLike = function() {
    if (vm.hasLiked) {
      removeLike();
    } else {
      addLike();
    }

    vm.action = getAction();
  };

  vm.flow.$promise.then(function() {
    vm.likeCount = vm.flow.likes;
    return Flow.hasLiked({ flowId: vm.flow.id, anonId: cookieAnonId }).$promise;
  }).then(function(response) {
    vm.hasLiked = response.hasLiked;
    vm.action = getAction();
  });
};

var flowLike = function() {
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
};

angular.module('acromaster.directives')
  .controller('LikeDirectiveController', ['Flow', 'AuthService', '$cookieStore', LikeDirectiveController])
  .directive('flowLike', flowLike);