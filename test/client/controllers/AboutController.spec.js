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
      close: sinon.spy()
    };
  }));

  it('should set the version to the server version', function() {
    var $scope = {};
    $httpBackend.expectGET('/version').respond(200, 'myversion');
    
    // Create controller
    $controller('AboutController', { $scope: $scope, $modalInstance: $modalInstance });
    $httpBackend.flush();
    $scope.version.should.equal('myversion');
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});