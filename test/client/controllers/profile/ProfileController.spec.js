'use strict';

describe('Profile*Controllers', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  var $controller;
  var $httpBackend;

  var User;
  var profile;

  beforeEach(inject(function(_$controller_, _$httpBackend_, _User_, $routeParams) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;

    User = _User_;
    $routeParams.user = 'someUser';

    sandbox = sinon.sandbox.create();
    profile = {
      name: 'foo',
      flows: ['a', 'b'],
      stats: {
        flowsPlayed: 10,
        moves: 200,
        minutesPlayed: 100
      }
    };
  }));

  afterEach(function() {
    sandbox.restore();
  });

  var assertProfileEqual = function(o) {
    o.name.should.eql(profile.name);
    o.flows.should.eql(profile.flows);
  };

  describe('ProfileHomeController', function() {
    it('should set the profile from the server', function() {
      $httpBackend.expectGET('/api/profile/someUser').respond(profile);
      var vm = $controller('ProfileHomeController');
      $httpBackend.flush();
      assertProfileEqual(vm.profile);
    });

    it('should show an error if the user does not exist', function() {
      // TODO
      expect(true).to.be.true;
    });
  });

  describe('ProfileAchievementsController', function() {
    it('should set the profile from the server', function() {
      $httpBackend.expectGET('/api/profile/someUser').respond(profile);
      var vm = $controller('ProfileAchievementsController');
      $httpBackend.flush();
      assertProfileEqual(vm.profile);
    });

    it('should show an error if the user does not exist', function() {
      // TODO
      expect(true).to.be.true;
    });
  });

  describe('ProfileFlowsController', function() {
    it('should set the profile from the server', function() {
      var flows = [{name: 'flow1'}, {name: 'flow2'}];
      $httpBackend.expectGET('/api/profile/someUser').respond(profile);
      $httpBackend.expectGET('/api/profile/someUser/flows').respond(flows);
      var vm = $controller('ProfileFlowsController');
      $httpBackend.flush();
      
      assertProfileEqual(vm.profile);
      vm.flows.should.have.length(2);
      vm.flows[0].name.should.eql(flows[0].name);
    });

    it('should show an error if the user does not exist', function() {
      // TODO
      expect(true).to.be.true;
    });
  });

  describe('ProfileFavoritesController', function() {
    it('should set the profile from the server', function() {
      var flows = [{name: 'flow1'}, {name: 'flow2'}];
      $httpBackend.expectGET('/api/profile/someUser').respond(profile);
      $httpBackend.expectGET('/api/profile/someUser/favorites').respond(flows);
      var vm = $controller('ProfileFavoritesController');
      $httpBackend.flush();
      
      assertProfileEqual(vm.profile);
      vm.flows.should.have.length(2);
      vm.flows[0].name.should.eql(flows[0].name);
    });

    it('should show an error if the user does not exist', function() {
      // TODO
      expect(true).to.be.true;
    });
  });
});