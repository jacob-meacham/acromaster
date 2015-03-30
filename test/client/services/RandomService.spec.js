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

  it('should choose a random element', function() {
    var size = ['Tiny', 'Little', 'Big', 'Huge'];
    expect(size).to.include.members([RandomService.choose(size)]);
  });
});