'use strict';

describe('SoundService', function() {
  beforeEach(function() {
    module('angulartics', function($analyticsProvider) { // Make angulartics a no-op, so that it doesn't mess with httpBackend requests.
      $analyticsProvider.developerMode(true);
      $analyticsProvider.virtualPageviews(false);
      $analyticsProvider.firstPageview(false);
    });
    module('acromaster');
  });

  var SoundService;
  var $httpBackend;

  beforeEach(inject(function(_$httpBackend_, _SoundService_) {
    $httpBackend = _$httpBackend_;
    SoundService = _SoundService_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should return a done sound', function(done) {
    $httpBackend.expectGET('/api/sounds/done').respond('doneSound1.wav');
    SoundService.getDoneSound().then(function(sound) {
      sound.should.eql('doneSound1.wav');
      done();
    });
    $httpBackend.flush();
  });

  it('should return the sounds root', function(done) {
    $httpBackend.expectGET('/api/sounds').respond('sounds/root/');
    SoundService.getRoot().then(function(sound) {
      sound.should.eql('sounds/root/');
      done();
    });
    $httpBackend.flush();
  });
});