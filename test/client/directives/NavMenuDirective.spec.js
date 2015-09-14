'use strict';

describe('NavMenuDirective', function() {
  beforeEach(function() {
    module('angulartics', function($analyticsProvider) { // Make angulartics a no-op, so that it doesn't mess with httpBackend requests.
      $analyticsProvider.developerMode(true);
      $analyticsProvider.virtualPageviews(false);
      $analyticsProvider.firstPageview(false);
    });
    module('acromaster');
  });

  var $compile;
  var $location;
  var $rootScope;
  var element;
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    inject(function(_$compile_, _$rootScope_, _$location_) {
      $compile = _$compile_;
      $location = _$location_;
      $rootScope = _$rootScope_;

      element = angular.element(
        '<ul nav-menu>' +
            '<li>' +
                '<a href="/">Home</a>' +
            '</li>' +
            '<li>' +
                '<a href="/about">About</a>' +
            '</li>' +
        '</ul>');
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should start with the correct link selected', function() {
    var compiled = $compile(element)($rootScope);
    $rootScope.$apply();

    var links = compiled.find('li');
    angular.element(links[0]).hasClass('active').should.be.true;
  });

  it('should use the specified class as the active class', function() {
    element.attr('nav-menu', 'newActive');
    var compiled = $compile(element)($rootScope);
    $rootScope.$apply();

    var links = compiled.find('li');
    angular.element(links[0]).hasClass('active').should.be.false;
    angular.element(links[0]).hasClass('newActive').should.be.true;
  });

  it('should select a new link on route change', function() {
    var compiled = $compile(element)($rootScope);
    $rootScope.$apply();

    sinon.stub($location, 'path').returns('/about');
    $rootScope.$emit('$routeChangeStart');

    var links = compiled.find('li');
    angular.element(links[0]).hasClass('active').should.be.false;
    angular.element(links[1]).hasClass('active').should.be.true;
  });

  it('should not error if an unknown path is selected', function() {
    var compiled = $compile(element)($rootScope);
    $rootScope.$apply();

    var links = compiled.find('li');
    angular.element(links[0]).hasClass('active').should.be.true;

    sinon.stub($location, 'path').returns('/unknown');
    $rootScope.$emit('$routeChangeStart');

    angular.element(links[0]).hasClass('active').should.be.false;
  });
});