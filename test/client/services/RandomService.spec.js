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

describe('RandomService', function() {
  beforeEach(module('acromaster'));
  var sandbox;
  var rand;
  var RandomNameService;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    rand = {
      random: function() { return 0.01; },
      choose: function(arr) { return arr[0]; }
    };

    module(function ($provide) {
      $provide.value('RandomService', rand);
    });
    inject(function(_RandomNameService_) {
      RandomNameService = _RandomNameService_;
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should return a flow name', function() {
    var name = RandomNameService.generateFlowName();

    name.should.eql('Flow of the Funky Dragon Masters');
  });

  it('should return a non-epic flow name', function() {
    sandbox.stub(rand, 'random').returns(0.8);
    var name = RandomNameService.generateFlowName();

    name.should.eql('The Dragon Flow');
  });

  it('should return a full non-epic name', function() {
    var randomStub = sandbox.stub(rand, 'random');
    randomStub.onCall(0).returns(1.0);
    randomStub.onCall(1).returns(0.01);
    randomStub.onCall(2).returns(1.0);
    var name = RandomNameService.generateFlowName();

    name.should.eql('Dragon Masters Flow');
  });

  it('should return a minimal flow name', function() {
    var randomStub = sandbox.stub(rand, 'random');
    randomStub.onCall(0).returns(1.0);
    randomStub.onCall(1).returns(1.0);
    randomStub.onCall(2).returns(0.01);
    var name = RandomNameService.generateFlowName();

    name.should.eql('Flow of the Dragon');
  });
});