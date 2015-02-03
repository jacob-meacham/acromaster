'use strict';

describe('RandomService', function() {
  beforeEach(module('acromaster'));
  var RandomService;

  beforeEach(inject(function(_RandomService_) {
    RandomService = _RandomService_;
  }));

  it('should return a random number', function() {
    RandomService.random().should.be.within(0, 1);
  });
});