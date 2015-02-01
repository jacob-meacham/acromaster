'use strict';

describe('AboutController', function() {
  beforeEach(module('acromaster'));

  var $controller;
  var $httpBackend;

  beforeEach(inject(function(_$controller_, _$httpBackend_) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
  }));

  it('should set the version to the server version', function() {
    var $scope = {};
    $httpBackend.expectGET('/version').respond(200, 'myversion');
    
    // Create controller
    $controller('AboutController', { $scope: $scope });
    $httpBackend.flush();
    $scope.version.should.equal('myversion');
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});