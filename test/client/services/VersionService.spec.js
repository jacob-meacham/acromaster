'use strict';

describe('VersionService', function() {
  beforeEach(function() {
    module('angulartics', function($analyticsProvider) { // Make angulartics a no-op, so that it doesn't mess with httpBackend requests.
      $analyticsProvider.developerMode(true);
      $analyticsProvider.virtualPageviews(false);
      $analyticsProvider.firstPageview(false);
    });
    module('acromaster');
  });

  var version;
  var $httpBackend;

  beforeEach(inject(function(_VersionService_, _$httpBackend_) {
    version = _VersionService_;
    $httpBackend = _$httpBackend_;
  }));

  it('should return the version from the server', function() {
    $httpBackend.expectGET('/version').respond('myversion');
    var versionNum = null;
    version.getVersion().success(function(ver) {
      versionNum = ver;
    });

    expect(versionNum).to.be.null;
    $httpBackend.flush();
    versionNum.should.eql('myversion');
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});