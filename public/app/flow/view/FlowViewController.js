'use strict';

var FlowViewController = function($routeParams, $location, $modal, flowService, authService, pageHeaderService, User) {
  var vm = this;
  var flowId = $routeParams.flowId;

  var flow = vm.flow = flowService.instantiateFlow(flowId, function(flow) {
    vm.canEdit = authService.canEdit(flow);
    pageHeaderService.setTitle(flow.name);
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
      User.unfavorite({ flowId: flowId, userId: authService.getUser().username});
    } else {
      User.favorite({ flowId: flowId, userId: authService.getUser().username});
    }

    vm.hasFavorited = !vm.hasFavorited;
    vm.action = getAction();
  };

  vm.delete = function() {
    var modalInstance = $modal.open({
      templateUrl: 'app/flow/edit/flow-delete-modal.html',
      backdrop: true,
    });

    modalInstance.result.then(function() {
      flow.$delete();
      $location.path('/flows/');
    });
  };
};

angular.module('acromaster.controllers')
  .controller('FlowViewController', ['$routeParams', '$location', '$modal', 'FlowService', 'AuthService', 'PageHeaderService', 'User', FlowViewController]);
