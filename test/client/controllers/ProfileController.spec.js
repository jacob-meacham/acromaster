'use strict';

describe('Profile*Controllers', function() {
  beforeEach(module('acromaster'));

  var $controller;
  var User;
  var sandbox;

  beforeEach(inject(function(_$controller_, _User_, $routeParams) {
    $controller = _$controller_;
    User = _User_;
    $routeParams.user = 'someUser';

    sandbox = sinon.sandbox.create();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  describe('ProfileHomeController', function() {
    it('should set the profile from the server', function() {
      var profile = {name: 'foo', flows: ['a', 'b']};
      sandbox.stub(User, 'get').returns(profile);
      var $scope = {};
      
      // Create controller
      $controller('ProfileHomeController', { $scope: $scope });
      $scope.profile.should.eql(profile);
    });

    it('should show an error if the user does not exist', function() {
      // TODO
      expect(true).to.be.true;
    });
  });
});