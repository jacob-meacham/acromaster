'use strict';

var FlowViewController = function($scope, $routeParams, $location, $modal, flowService, authService, User) {
  var flowId = $routeParams.flowId;

  var flow = $scope.flow = flowService.instantiateFlow(flowId, function() {
    $scope.canEdit = authService.canEdit(flow);
  });

  $scope.start = function() {
    $location.path('/flow/' + flow.id + '/play');
  };

  // TODO: DRY with LikeDirective
  var getAction = function() {
    if ($scope.hasFavorited) {
      return 'Unfavorite';
    } else {
      return 'Favorite';
    }
  };

  if (authService.isAuthenticated()) {
    User.hasFavorited({ flowId: flowId, userId: authService.getUser().id }, function(response) {
      $scope.hasFavorited = response.hasFavorited;
      $scope.action = getAction();
    });
  } else {
    $scope.hasFavorited = false;
    $scope.action = getAction();
  }

  $scope.toggleFavorite = function() {
    if (!authService.isAuthenticated()) {
      // TODO: popup a box in this case.
      return;
    }

    if ($scope.hasFavorited) {
      User.unfavorite({ flowId: flowId, userId: authService.getUser().id});
    } else {
      User.favorite({ flowId: flowId, userId: authService.getUser().id});
    }

    $scope.hasFavorited = !$scope.hasFavorited;
    $scope.action = getAction();
  };

  $scope.delete = function() {
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
  .controller('FlowViewController', ['$scope', '$routeParams', '$location', '$modal', 'FlowService', 'AuthService', 'User', FlowViewController]);
