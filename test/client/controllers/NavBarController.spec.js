'use strict';

describe('NavbarController', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  
  var $controller;
  var AuthService;

  beforeEach(inject(function(_$controller_, _AuthService_) {
    $controller = _$controller_;
    AuthService = _AuthService_;

    sandbox = sinon.sandbox.create();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('should reflect auth', function() {
    var user = {name: 'foo', roles: []};
    AuthService.setUser(user);

    var vm = $controller('NavbarController');

    vm.user.should.eql(user);
    vm.authenticated.should.eql(true);
  });

  it('should allow for logout', function() {
    var user = {name: 'foo', roles: []};
    AuthService.setUser(user);
    var logoutStub = sandbox.stub(AuthService, 'logout', function(callback) {
      AuthService.clearUser();
      callback();
    });

    var vm = $controller('NavbarController');

    vm.user.should.eql(user);
    vm.authenticated.should.eql(true);

    vm.logout();

    logoutStub.should.have.callCount(1);
    expect(vm.user).to.be.null;
    vm.authenticated.should.be.false;
  });
});
