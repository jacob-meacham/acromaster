'use strict';

var controllers = angular.module('acromaster.controllers', []);

controllers.controller('NavbarController', ['$scope', '$http', '$location', '$route', 'authService', function($scope, $http, $location, $route, authService) {
  var resetAuth = function() {
    $scope.user = authService.getUser();
    $scope.authenticated = authService.isAuthenticated();
  };

  $scope.logout = function() {
    $http.get('/logout').success(function() {
      authService.clearUser();
      resetAuth();

      $location.url('/');
      $route.reload();
    });
  };

  resetAuth();
}]);

controllers.controller('AboutController', ['$scope', '$http', function($scope, $http) {
  $http.get('/version').success(function(data) {
    $scope.version = data;
  });
}]);

// Quick Create
controllers.controller('QuickPlayCreateController', ['$scope', '$location', 'Flow', 'flowService', function($scope, $location, Flow, flowService) {
  var flowParams = $scope.flowParams = {totalMinutes: 30, difficulty: 3, timePerMove: 15, timeVariance: 10};

  $scope.start = function() {
    flowParams.totalTime = flowParams.totalMinutes * 60;
    Flow.generate(flowParams, function(newFlow) {
      flowService.setCurrentFlow(newFlow);
      $location.path('/flow/quick/play');
    });
  };
}]);

controllers.controller('FlowPlayController', ['$scope', '$interval', '$location', '$routeParams', 'flowService', 'Flow', function($scope, $interval, $location, $routeParams, flowService, Flow) {
  var flow = flowService.getCurrentFlow();
  if (flow === null) {
    flow = Flow.get({flowId: $routeParams.flowId});
  }
  
  $scope.flow = flow;
  var currentEntry = {};
  $scope.currentMove = {};

  angular.forEach(flow.moves, function(entry) {
    entry.visible = false;
  });

  var intervalPromise;
  var nextMove = function(entryIndex) {
    if (currentEntry) {
      currentEntry.visible = false;
    }

    if (entryIndex >= flow.moves.length) {
      $location.path('/flow/quick');
    }
    
    currentEntry = flow.moves[entryIndex];
    currentEntry.visible = true;
    $scope.currentMove = currentEntry.move;

    intervalPromise = $interval(function() {
      nextMove(entryIndex+1); }, currentEntry.duration * 1000, 1);
  };
  
  $scope.$on('$routeChangeSuccess', function () {
    nextMove(0);
  });

  $scope.$on('$destroy', function() {
    if (angular.isDefined(intervalPromise)) {
      $interval.cancel(intervalPromise);
      intervalPromise = undefined;
    }
  });
}]);

controllers.controller('FlowListController', ['$scope', 'Flow', function($scope, Flow) {
  var find = $scope.find = function(query) {
    var flowResponse = Flow.get(query, function() {
      $scope.flows = flowResponse.flows;
    });
  };

  find();
}]);

controllers.controller('FlowCreateController', ['$scope', '$location', 'Flow', 'Moves', function($scope, $location, Flow, Moves) {
  $scope.allMoves = Moves.query();
  var flow = $scope.flow = new Flow({moves: []});
  $scope.currentMove = null;
  $scope.currentDuration = 20;

  // TODO: Need a much better way to do this.
  $scope.moveList = [];

  // TODO: Refactor into directive.
  $scope.addMove = function() {
    flow.moves.push({
      move: $scope.currentMove._id,
      duration: $scope.currentDuration
    });

    // Currently need to keep two lists so that the flow only keeps the
    // move id.
    $scope.moveList.push({
      move: $scope.currentMove,
      duration: $scope.currentDuration
    });
    
    $scope.currentMove = null;
    $scope.currentDuration = 20;
  };

  $scope.create = function() {
    flow.$save(function(savedFlow) {
      $location.path('/flow/' + savedFlow._id);
    });
  };
}]);

controllers.controller('FlowEditController', ['$scope', '$routeParams', 'Flow', function($scope, $routeParams, Flow) {
  var flow = $scope.flow = Flow.get({flowId: $routeParams.flowId});
  flow.$update();
}]);

controllers.controller('FlowViewController', ['$scope', '$routeParams', '$location', 'Flow', 'flowService', function($scope, $routeParams, $location, Flow, flowService) {
  var flow = $scope.flow = Flow.get({flowId: $routeParams.flowId});

  $scope.start = function() {
    // Pass the flow we'd like to use on.
    flowService.setFlow(flow);
    $location.path('/flow/' + flow._id + '/play');
  };
}]);

controllers.controller('WashingMachineViewController', ['$scope', '$location', 'Moves', function($scope, $location, Moves) {
  var movesPromise = Moves.query({'tags': 'static'});

  var choose = function(arr) {
    return arr[Math.floor(Math.random()*arr.length)];
  };

  var generateName = function() {
    var name = '';
    if (Math.random() < 0.2) {
      name += 'Goofy ';
    }

    if (Math.random() < 0.5) {
      name += 'Reverse ';
    }

    if (Math.random() < 0.4) {
      var size = ['Tiny', 'Little', 'Big', 'Huge'];
      name = name + choose(size) + ' ';
    }

    if (Math.random() < 0.4) {
      var location = ['Seattle', 'London', 'Dutch', 'Swedish'];
      name = name + choose(location) + ' ';
    }

    var descriptor = ['Grease', 'Tickler', 'Samurai', 'Ninja', 'Secret', 'Plush', 'Star Wars', 'Jedi', 'Krunk', 'Blue', 'Bunny', 'Freezer'];
    name = name + choose(descriptor) + ' ';

    var noun = ['Log', 'Ball', 'Roll', 'Puppet', 'Frog', 'Salamander', 'Twister', 'Whippet', 'Cranberry', 'Taser', 'Freeze', 'Dive', 'Bomb'];
    name = name + choose(noun) + ' ';

    if (Math.random() < 0.1) {
      var modifier = ['Amazingness', 'Friendship', 'the King', 'the Queen'];
      name = name + ' of ' + choose(modifier);
    }
    return name;
  };

  $scope.move1 = null;
  $scope.move2 = null;
  $scope.generate = function() {
    movesPromise.$promise.then(function(moves) {
      $scope.move1 = choose(moves);
      $scope.move2 = choose(moves);
      while ($scope.move2 === $scope.move1) {
        $scope.move2 = choose(moves);
      }
      $scope.washing_machine = generateName();
    });
  };

  $scope.$on('$routeChangeSuccess', function () {
    $scope.generate();
  });
}]);