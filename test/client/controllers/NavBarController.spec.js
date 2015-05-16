'use strict';

describe('NavbarController', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  
  var $scope;
  var AuthService;
  var $controller;
  var $modal;

  beforeEach(inject(function(_$controller_, _$modal_, _AuthService_) {
    $controller = _$controller_;
    $modal = _$modal_;
    AuthService = _AuthService_;
    $scope = {};

    sandbox = sinon.sandbox.create();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('should reflect auth', function() {
    var user = {name: 'foo', roles: []};
    AuthService.setUser(user);

    $controller('NavbarController', { $scope: $scope, AuthService: AuthService});

    $scope.user.should.eql(user);
    $scope.authenticated.should.eql(true);
  });

  it('should allow for logout', function() {
    var user = {name: 'foo', roles: []};
    AuthService.setUser(user);
    var logoutStub = sandbox.stub(AuthService, 'logout', function(callback) {
      AuthService.clearUser();
      callback();
    });

    $controller('NavbarController', { $scope: $scope, AuthService: AuthService});

    $scope.user.should.eql(user);
    $scope.authenticated.should.eql(true);

    $scope.logout();

    logoutStub.should.have.callCount(1);
    expect($scope.user).to.be.null;
    $scope.authenticated.should.be.false;
  });

  it('should open the About modal', function() {
    var openStub = sandbox.stub($modal, 'open');

    $controller('NavbarController', { $scope: $scope, AuthService: AuthService});

    $scope.about();
    openStub.should.have.callCount(1);
    var openCall = openStub.getCall(0);
    openCall.args[0].controller.should.eql('AboutController');
  });
});