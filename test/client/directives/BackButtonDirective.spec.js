'use strict';

describe('BackButtonDirective', function() {
  beforeEach(function() {
    module('angulartics', function($analyticsProvider) { // Make angulartics a no-op, so that it doesn't mess with httpBackend requests.
      $analyticsProvider.developerMode(true);
      $analyticsProvider.virtualPageviews(false);
      $analyticsProvider.firstPageview(false);
    });
    module('acromaster');
  });

  var $compile;
  var $rootScope;

  beforeEach(function() {
    inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  it('should create a back button with a url', function() {
    var element = $compile('<back-button url="foo/bar/baz"></backbuton>')($rootScope);
    $rootScope.$digest();
    angular.element(element.children()[0]).prop('href').should.match(/foo\/bar\/baz/);
  });
});