'use strict';

describe('DebugDirective', function() {
  beforeEach(module('acromaster'));

  var $compile;
  var $rootScope;
  var environment;

  beforeEach(function() {
    // Stub-stub, so that sinon can actually stub isDebug later on
    environment = {
      isDebug: function() {}
    };

    module(function ($provide) {
        $provide.value('environment', environment);
    });

    inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  it('should include ng-hide when debug is false', function() {
    sinon.stub(environment, 'isDebug').returns(false);
    var element = $compile('<debug>f00</debug>')($rootScope);
    element.hasClass('ng-hide').should.be.true;
  });

  it('should not include ng-hide when debug is true', function() {
    sinon.stub(environment, 'isDebug').returns(true);
    var element = $compile('<debug>f00</debug>')($rootScope);
    element.hasClass('ng-hide').should.be.false;
  });
});