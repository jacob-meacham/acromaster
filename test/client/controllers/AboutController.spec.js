'use strict';

describe('AboutController', function() {
  beforeEach(module('acromaster'));

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
    var $scope = {};
    $controller('AboutController', { $scope: $scope, $modalInstance: $modalInstance });
    $httpBackend.flush();
    $scope.version.should.equal('myversion');
  });

  it('should allow dismissal of the modal', function() {
    var $scope = {};
    var dismissSpy = $modalInstance.dismiss = sinon.spy();
    $controller('AboutController', { $scope: $scope, $modalInstance: $modalInstance });
    $scope.exit.should.exist;

    $scope.exit();
    dismissSpy.should.have.callCount(1);
    dismissSpy.should.have.been.calledWith('exit');
    $httpBackend.flush();
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});