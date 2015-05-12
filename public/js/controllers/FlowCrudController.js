'use strict';

var controllers = angular.module('acromaster.controllers');

controllers.controller('FlowHomeController', ['$scope', '$location', 'Flow', 'PageHeaderService', function($scope, $location, Flow, PageHeaderService) {
  Flow.get({random: true, max: 11}, function(response) {
    $scope.randomFlow = response.flows[0];
    $scope.featuredFlows = response.flows.slice(1, response.total);
  });

  PageHeaderService.setTitle('Acromaster - Flows');

  $scope.search = function() {
    $location.path('/flows/results').search({search_query: $scope.searchQuery});
  };
}]);

controllers.controller('FlowSearchResultsController', ['$scope', 'flows', function($scope, flowsPromise) {
  $scope.flows = flowsPromise.flows;
}]);

controllers.controller('FlowCreateController', ['$scope', '$routeParams', '$location', 'Flow', 'FlowService', function($scope, $routeParams, $location, Flow, flowService) {
  $scope.flow = new Flow({moves: []});
  if ($routeParams.flowId) {
    flowService.instantiateFlow($routeParams.flowId, function(flow) {
      $scope.flow = new Flow({moves: []}); // Force the value to change
      $scope.flow.moves = flow.moves;
      $scope.flow.name = 'Remix of ' + flow.name;
    });
  }
  
  $scope.saveSuccess = function(savedFlow) {
    $location.path('/flow/' + savedFlow.id);
  };
}]);

controllers.controller('FlowEditController', ['$scope', '$routeParams', '$location', 'FlowService', function($scope, $routeParams, $location, flowService) {
  flowService.instantiateFlow($routeParams.flowId, function(flow) {
    // Done this way to let the directive watch the top-level variable.
    $scope.flow = flow;
  });

  $scope.saveSuccess = function(savedFlow) {
    $location.path('/flow/' + savedFlow.id);
  };
}]);

controllers.controller('FlowViewController', ['$scope', '$routeParams', '$location', '$modal', 'FlowService', 'AuthService', 'User', function($scope, $routeParams, $location, $modal, flowService, authService, User) {
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
}]);
