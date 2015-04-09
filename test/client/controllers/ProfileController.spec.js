'use strict';

describe('AboutController', function() {
  beforeEach(module('acromaster'));

  var $controller;
  var $httpBackend;
  var 

  // TODO: How to inject routeParams
  beforeEach(inject(function(_$controller_, _$httpBackend_, $routeParams) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $routParams.user = 'someUser';
  }));

  it('should set the profile from the server', function() {
    var $scope = {};
    var profile = {name: 'foo', flows: ['a', 'b']};
    $httpBackend.expectGET('/api/profile/someUser').respond(200, profile);
    
    // Create controller
    $controller('ProfileController', { $scope: $scope });
    $httpBackend.flush();
    $scope.profile.should.equal(profile);
  });

  it('should show an error if the user does not exist', function() {
    // TODO
    expect(true).to.be.false();
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});