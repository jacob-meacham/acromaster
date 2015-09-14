'use strict';

describe('AboutController', function() {
  beforeEach(function() {
    module('angulartics', function($analyticsProvider) { // Make angulartics a no-op, so that it doesn't mess with httpBackend requests.
      $analyticsProvider.developerMode(true);
      $analyticsProvider.virtualPageviews(false);
      $analyticsProvider.firstPageview(false);
    });
    module('acromaster');
  });

  var $controller;
  var $httpBackend;
  var $modalInstance;

  beforeEach(inject(function(_$controller_, _$httpBackend_) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $modalInstance = {
      close: sinon.spy(),
    };

    $httpBackend.expectGET('/version').respond(200, 'myversion');
  }));

  it('should set the version to the server version', function() {
    var vm = $controller('AboutController', {$modalInstance: $modalInstance});
    $httpBackend.flush();
    vm.version.should.equal('myversion');
  });

  it('should allow dismissal of the modal', function() {
    var dismissSpy = $modalInstance.dismiss = sinon.spy();
    var vm = $controller('AboutController', {$modalInstance: $modalInstance});
    vm.exit.should.exist;

    vm.exit();
    dismissSpy.should.have.callCount(1);
    dismissSpy.should.have.been.calledWith('exit');
    $httpBackend.flush();
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});