'use strict';

describe('AboutController', function() {
  beforeEach(module('acromaster'));

  var $controller;
  var $httpBackend;

  // TODO: How to inject routeParams
  beforeEach(inject(function(_$controller_, _$httpBackend_, $routeParams) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $routeParams.user = 'someUser';
  }));

  it('should set the profile from the server', function() {
    var $scope = {};
    var profile = {name: 'foo', flows: ['a', 'b']};
    $httpBackend.expectGET('/api/profile/someUser').respond(200, profile);
    
    // Create controller
    $controller('ProfileController', { $scope: $scope });
    $httpBackend.flush();
    $scope.profile.should.eql(profile);
  });

  it('should show an error if the user does not exist', function() {
    // TODO
    expect(true).to.be.true();
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});