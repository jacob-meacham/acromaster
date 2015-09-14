'use strict';

describe('Moves', function() {
  beforeEach(function() {
    module('angulartics', function($analyticsProvider) { // Make angulartics a no-op, so that it doesn't mess with httpBackend requests.
      $analyticsProvider.developerMode(true);
      $analyticsProvider.virtualPageviews(false);
      $analyticsProvider.firstPageview(false);
    });
    module('acromaster');
  });

  var Moves;
  var $httpBackend;

  beforeEach(inject(function(_Moves_, _$httpBackend_) {
    Moves = _Moves_;
    $httpBackend = _$httpBackend_;
  }));

  it('should query all moves', function() {
    $httpBackend.expectGET('/api/moves').respond([]);
    Moves.query();
    $httpBackend.flush();
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});
