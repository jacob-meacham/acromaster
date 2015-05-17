'use strict';

describe('FlowHomeController', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  
  var $scope;
  var $controller;

  var Flow;
  var $location;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    $scope = {};

    inject(function(_$controller_, _Flow_, _$location_) {
      $controller = _$controller_;
    
      Flow = _Flow_;
      $location = _$location_;
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should start with a random flow and feature flows', function() {
    var flows = [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}];
    sandbox.stub(Flow, 'get', function(query, callback) {
      callback({flows: flows, total: 3});
    });

    $controller('FlowHomeController', {$scope: $scope});
    flows.should.contain($scope.randomFlow);
    $scope.featuredFlows.should.have.length(2);
    $scope.featuredFlows[0].should.eql(flows[1]);
    $scope.featuredFlows[1].should.eql(flows[2]);
  });

  it('should expose find', function() {
    var locationSpy = sandbox.spy($location, 'path');

    $controller('FlowHomeController', {$scope: $scope});
    $scope.searchQuery = 'beginner';
    $scope.search();

    // Ensure that the location is set correctly, with the query param.
    locationSpy.should.have.callCount(1);
    locationSpy.returnValues[0].$$url.should.eql('/flows/results?search_query=beginner');
  });
});
