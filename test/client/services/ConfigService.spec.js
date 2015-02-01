'use strict';

describe('ConfigService', function() {
  beforeEach(module('acromaster'));
  var $window;

  beforeEach(inject(function(_$window_) {
    $window = _$window_;
  }));

  describe('_ factory', function() {
      var _;
      beforeEach(inject(function(___) {
        _ = ___;
      }));

      it('should return lodash from window', function() {
        _.should.equal($window._);
      });
  });

  describe('environment factory', function() {
    var environment;
    beforeEach(inject(function(_environment_) {
      environment = _environment_;
    }));

    describe('isDebug', function() {
      it('should return true when env is development', function() {
        $window.env = 'development';
        environment.isDebug().should.be.true();
      });

      it('should return false when env is not development', function() {
        $window.env = null;
        environment.isDebug().should.not.be.true();
      });
    });
  });
});