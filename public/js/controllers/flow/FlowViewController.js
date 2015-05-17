'use strict';

var FlowViewController = function($routeParams, $location, $modal, flowService, authService, User) {
  var vm = this;
  var flowId = $routeParams.flowId;

  var flow = vm.flow = flowService.instantiateFlow(flowId, function() {
    vm.canEdit = authService.canEdit(flow);
  });

  vm.start = function() {
    $location.path('/flow/' + flow.id + '/play');
  };

  // TODO: DRY with LikeDirective
  var getAction = function() {
    if (vm.hasFavorited) {
      return 'Unfavorite';
    } else {
      return 'Favorite';
    }
  };

  if (authService.isAuthenticated()) {
    User.hasFavorited({ flowId: flowId, userId: authService.getUser().id }, function(response) {
      vm.hasFavorited = response.hasFavorited;
      vm.action = getAction();
    });
  } else {
    vm.hasFavorited = false;
    vm.action = getAction();
  }

  vm.toggleFavorite = function() {
    if (!authService.isAuthenticated()) {
      // TODO: popup a box in this case.
      return;
    }

    if (vm.hasFavorited) {
      User.unfavorite({ flowId: flowId, userId: authService.getUser().id});
    } else {
      User.favorite({ flowId: flowId, userId: authService.getUser().id});
    }

    vm.hasFavorited = !vm.hasFavorited;
    vm.action = getAction();
  };

  vm.delete = function() {
    var modalInstance = $modal.open({
      templateUrl: 'partials/flow/delete_modal.html',
      backdrop: true,
    });

    modalInstance.result.then(function() {
      flow.$delete();
      $location.path('/flows/');
    });
  };
};

angular.module('acromaster.controllers')
  .controller('FlowViewController', ['$routeParams', '$location', '$modal', 'FlowService', 'AuthService', 'User', FlowViewController]);
