'use strict';

var FlowViewController = function($routeParams, $location, $scope, $modal, flash, flowService, authService, pageHeaderService, User) {
  var vm = this;
  vm.flash = flash;
  var flowId = $routeParams.flowId;
  var flow;

  var instantiateFlow = function() {
    flow = vm.flow = flowService.instantiateFlow(flowId, function(flow) {
      vm.canEdit = authService.canEdit(flow);
      pageHeaderService.setTitle(flow.name);
    });
  };

  instantiateFlow();

  vm.retryInstantiate = function() {
    vm.flash.error = false;
    instantiateFlow();
  };

  vm.start = function() {
    $location.path('/flow/' + flow.id + '/play');
  };

  // TODO: DRY with LikeDirective
  var getAction = function() {
    if (vm.hasFavorited) {
      return 'Remove Favorite';
    } else {
      return 'Add Favorite';
    }
  };

  if (authService.isAuthenticated()) {
    User.hasFavorited({ flowId: flowId, userId: authService.getUser().username }, function(response) {
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
      size: 'sm'
    });

    modalInstance.result.then(function() {
      flow.$delete();
      $location.path('/flows/');
    });
  };

  vm.showInfoModal = function(moveEntry) {
    var modalScope = $scope.$new(true);
    modalScope.moveEntry = moveEntry;
    $modal.open({
      templateUrl: 'app/flow/view/move-info-popover.html',
      scope: modalScope,
      size: 'sm',
      backdrop: true
    });
  };
};

angular.module('acromaster.controllers')
  .controller('FlowViewController', ['$routeParams', '$location', '$scope', '$modal', 'flash', 'FlowService', 'AuthService', 'PageHeaderService', 'User', FlowViewController]);
