'use strict';

describe('FlowPlayerDirective', function() {
  beforeEach(function() {
    module('angulartics', function($analyticsProvider) { // Make angulartics a no-op, so that it doesn't mess with httpBackend requests.
      $analyticsProvider.developerMode(true);
      $analyticsProvider.virtualPageviews(false);
      $analyticsProvider.firstPageview(false);
    });
    module('acromaster', 'acromaster.templates');
  });

  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('SearchBarDirectiveController', function() {
    var $location;
    var $controller;

    beforeEach(inject(function(_$controller_, _$location_) {
      $location = _$location_;
      $controller = _$controller_;
    }));

    it('should expose find', function() {
      var locationSpy = sandbox.spy($location, 'path');

      var vm = $controller('SearchBarDirectiveController');
      vm.searchQuery = 'beginner';
      vm.search();

      // Ensure that the location is set correctly, with the query param.
      locationSpy.should.have.callCount(1);
      locationSpy.returnValues[0].$$url.should.eql('/flows/results?search_query=beginner');
    });
  });
});