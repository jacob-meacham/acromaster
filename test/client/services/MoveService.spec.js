'use strict';

describe('Moves', function() {
  beforeEach(module('acromaster'));

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
