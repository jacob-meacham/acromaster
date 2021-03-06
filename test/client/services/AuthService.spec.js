'use strict';

describe('AuthService', function() {
  beforeEach(function() {
    module('angulartics', function($analyticsProvider) { // Make angulartics a no-op, so that it doesn't mess with httpBackend requests.
      $analyticsProvider.developerMode(true);
      $analyticsProvider.virtualPageviews(false);
      $analyticsProvider.firstPageview(false);
    });
    module('acromaster');
  });

  var AuthService;
  var $window;
  var user;

  before(function() {
    user = {name: 'userName', id: 'userId'};
  });

  describe('with a user set', function() {
    beforeEach(inject(function(_$window_) {
      $window = _$window_;
      $window.user = user;
    }));

    beforeEach(inject(function(_AuthService_) {
      AuthService = _AuthService_;
    }));

    it('should get the user set on the $window', function() {
      expect(AuthService.getUser()).to.exist;
      AuthService.getUser().should.eql(user);
    });

    it('should be authenticated with a user', function() {
      AuthService.isAuthenticated().should.be.true;
    });

    it('should be able to clear the user', function() {
      AuthService.clearUser();
      expect(AuthService.getUser()).to.be.null;
    });

    it('should not be authenticated if the user is cleared', function() {
      AuthService.clearUser();
      AuthService.isAuthenticated().should.not.be.true;
    });

    describe('logout', function() {
      var pathSpy;
      var routeStub;
      var clearSpy;
      var $httpBackend;
      var sandbox;

      beforeEach(function() {
        sandbox = sinon.sandbox.create();

        clearSpy = sandbox.spy(AuthService, 'clearUser');
        inject(function($location, $route, _$httpBackend_) {
          pathSpy = sandbox.spy($location, 'path');
          routeStub = sandbox.stub($route, 'reload');
          $httpBackend = _$httpBackend_;
        });

        $httpBackend.expectGET('/logout').respond({});
        $httpBackend.expectGET('/app/home/home.html').respond({});
      });


      afterEach(function() {
        sandbox.restore();
      });

      var logoutExpectations = function() {
        expect($window.user).to.be.null;
        clearSpy.should.have.callCount(1);

        routeStub.should.have.callCount(1);
        pathSpy.should.have.have.been.calledWith('/');
      };

      it('should logout with no callback specified', function() {
        AuthService.logout();
        $httpBackend.flush();

        logoutExpectations();
      });

      it('should call logout callback', function() {
        var callbackSpy = sandbox.spy();
        
        AuthService.logout(callbackSpy);
        $httpBackend.flush();

        callbackSpy.should.have.callCount(1);
        logoutExpectations();
      });
    });
  });

  describe('with no user set', function() {
    beforeEach(inject(function(_$window_) {
      $window = _$window_;
      $window.user = null;
    }));

    beforeEach(inject(function(_AuthService_) {
      AuthService = _AuthService_;
    }));


    it('should start with no user', function() {
      expect(AuthService.getUser()).to.be.null;
    });

    it('should not start authenticated', function() {
      AuthService.isAuthenticated().should.not.be.true;
    });

    it('should allow setting a user', function() {
      expect(AuthService.getUser()).to.be.null;
      AuthService.setUser(user);
      AuthService.getUser().should.eql(user);
    });
  });

  describe('with empty user', function() {
    beforeEach(inject(function(_$window_) {
      $window = _$window_;
      $window.user = {};
    }));

    beforeEach(inject(function(_AuthService_) {
      AuthService = _AuthService_;
    }));


    it('should not be authenticated', function() {
      expect(AuthService.getUser()).to.not.be.null;
      AuthService.isAuthenticated().should.not.be.true;
    });
  });

  describe('canEdit', function() {
    beforeEach(inject(function(_$window_) {
      $window = _$window_;
      $window.user = {};
    }));

    beforeEach(inject(function(_AuthService_) {
      AuthService = _AuthService_;
    }));

    it('should return false if the flow is not valid', function() {
      AuthService.canEdit(null).should.be.false;
      AuthService.canEdit({name: 'flow'}).should.be.false;
    });

    it('should return false if no user is logged in', function() {
      AuthService.canEdit({name: 'flow', author: { id: 'authorId' }}).should.be.false;
    });

    it('should return false if the author and user do not match', function() {
      AuthService.setUser({id: 'userId'});
      AuthService.canEdit({name: 'flow', author: { id: 'authorId' }}).should.be.false;
    });

    it('should allow editing on a match', function() {
      AuthService.setUser({id: 'authorId'});
      AuthService.canEdit({name: 'flow', author: { id: 'authorId' }}).should.be.true;
    });
  });
});