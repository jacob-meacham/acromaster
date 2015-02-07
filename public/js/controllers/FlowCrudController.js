'use strict';

var controllers = angular.module('acromaster.controllers');

controllers.controller('FlowListController', ['$scope', 'Flow', function($scope, Flow) {
  var find = $scope.find = function(query) {
    var flowResponse = Flow.get(query, function() {
      $scope.flows = flowResponse.flows;
    });
  };

  find();
}]);

controllers.controller('FlowCreateController', ['$scope', '$location', 'flash', '_', 'Flow', 'Moves', function($scope, $location, flash, _, Flow, Moves) {
  $scope.allMoves = Moves.query();
  var flow = $scope.flow = new Flow({moves: []});

  $scope.moveList = [];

  // TODO: Refactor into directive.
  $scope.addMove = function() {
    $scope.inserted = {
      move: null,
      duration: 20
    };
    
    $scope.moveList.push($scope.inserted);
  };

  $scope.updateMove = function(index, $data) {
    $scope.moveList[index].move = $data;
  };

  $scope.removeMove = function(index) {
    $scope.moveList.splice(index, 1);
  };

  $scope.cancelMove = function(index) {
    // If the move has no name, just remove.
    $scope.moveList.splice(index, 1);
  };

  $scope.checkMove = function($data) {
    console.log($data);
    if ($data === undefined) {
      return 'No move specified';
    }

    if (_.indexOf($scope.allMoves, $data) < 0) {
      return 'Not a valid move';
    }
  };

  $scope.checkDuration = function($data) {
    if ($data === undefined) {
      return 'Move must have a duration';
    }

    var duration = parseInt($data, 10);
    if (isNaN(duration) || duration < 0) {
      return 'Duration must be a valid number';
    }
  };

  $scope.create = function() {
    flow.moves = [];
    for (var i = 0; i < $scope.moveList.length; i++) {
      flow.moves.push({
        move: $scope.moveList[i].move._id,
        duration: $scope.moveList[i].duration
      });
    }

    var saveSuccess = function(savedFlow) {
      $location.path('/flow/' + savedFlow._id);
    };
    var saveFailure = function() {
      flash.error = 'There was an issue saving your flow. Correct any issues and re-submit';
    };

    flow.$save(saveSuccess, saveFailure);
  };
}]);

controllers.controller('FlowEditController', ['$scope', '$routeParams', '$location', 'flash', '_', 'Flow', 'Moves', function($scope, $routeParams, $location, flash, _, Flow, Moves) {
  $scope.allMoves = Moves.query();
  $scope.moveList = [];
  var flow = $scope.flow = Flow.get({flowId: $routeParams.flowId}, function() {
    angular.forEach(flow.moves, function(entry) {
      $scope.moveList.push({
        move: entry.move,
        duration: entry.duration
      });
    });
  });

  // TODO: Refactor into directive.
  $scope.addMove = function() {
    $scope.inserted = {
      move: null,
      duration: 20
    };
    
    $scope.moveList.push($scope.inserted);
  };

  $scope.updateMove = function(index, $data) {
    $scope.moveList[index].move = $data;
  };

  $scope.removeMove = function(index) {
    $scope.moveList.splice(index, 1);
  };

  $scope.cancelMove = function(index) {
    // If the move has no name, just remove.
    $scope.moveList.splice(index, 1);
  };

  $scope.checkMove = function($data) {
    console.log($data);
    if ($data === undefined) {
      return 'No move specified';
    }

    if (_.indexOf($scope.allMoves, $data) < 0) {
      return 'Not a valid move';
    }
  };

  $scope.checkDuration = function($data) {
    if ($data === undefined) {
      return 'Move must have a duration';
    }

    var duration = parseInt($data, 10);
    if (isNaN(duration) || duration < 0) {
      return 'Duration must be a valid number';
    }
  };

  $scope.create = function() {
    flow.moves = [];
    for (var i = 0; i < $scope.moveList.length; i++) {
      flow.moves.push({
        move: $scope.moveList[i].move._id,
        duration: $scope.moveList[i].duration
      });
    }

    var saveSuccess = function(savedFlow) {
      $location.path('/flow/' + savedFlow._id);
    };
    var saveFailure = function() {
      flash.error = 'There was an issue saving your flow. Correct any issues and re-submit';
    };

    flow.$update(flow._id, saveSuccess, saveFailure);
  };
}]);

controllers.controller('FlowViewController', ['$scope', '$routeParams', '$location', 'FlowService', function($scope, $routeParams, $location, FlowService) {
  var flow = $scope.flow = FlowService.instantiateFlow($routeParams.flowId);

  $scope.start = function() {
    $location.path('/flow/' + flow._id + '/play');
  };
}]);