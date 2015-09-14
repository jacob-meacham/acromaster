'use strict';

describe('ShareDirective', function() {
  beforeEach(function() {
    module('angulartics', function($analyticsProvider) { // Make angulartics a no-op, so that it doesn't mess with httpBackend requests.
      $analyticsProvider.developerMode(true);
      $analyticsProvider.virtualPageviews(false);
      $analyticsProvider.firstPageview(false);
    });
    module('acromaster', 'acromaster.templates');
  });

  var sandbox;
  var $rootScope;
  
  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    inject(function(_$rootScope_, $location) {
      $rootScope = _$rootScope_;
      sandbox.stub($location, 'absUrl').returns('acromaster.org/flow/myFlow/edit');
      sandbox.stub($location, 'url').returns('/flow/myFlow/edit');
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('ShareDirectiveController', function() {
    var $controller;

    beforeEach(inject(function(_$controller_) {
      $controller = _$controller_;
    }));

    it('should have the correct base url', function() {
      var ctrl = $controller('ShareDirectiveController');
      ctrl.baseUrl.should.eql('acromaster.org');
    });
  });

  describe('directive', function() {
    var $compile;
    var $document;
    var $timeout;

    beforeEach(inject(function(_$compile_, _$document_, _$timeout_) {
      $compile = _$compile_;
      $document = _$document_;
      $timeout = _$timeout_;
    }));

    it('should bind to the controller', function() {
      var element = $compile('<share share-partial="flow/someAwesomeFlow"></share>')($rootScope);
      $rootScope.$digest();

      var ctrl = element.isolateScope().vm;
      ctrl.sharePartial.should.eql('flow/someAwesomeFlow');
    });

    it('should create an nspopover with the appropriate text', function() {
      $compile('<share share-partial="flow/someAwesomeFlow"></share>')($rootScope);
      $rootScope.$digest();

      $timeout.flush(2000);

      var input = $document.find('input');
      input.val().should.eql('acromaster.org/flow/someAwesomeFlow');
    });

    it('should cancel the compile timeout', function() {
      var cancelTimeout = sandbox.spy($timeout, 'cancel');
      var element = $compile('<share share-partial="flow/someAwesomeFlow"></share>')($rootScope);
      $rootScope.$digest();

      element.triggerHandler('$destroy');
      cancelTimeout.should.have.callCount(1);
    });

    it('should cancel the focus timeout, if it exists', function() {
      var cancelTimeout = sandbox.spy($timeout, 'cancel');
      var element = $compile('<share share-partial="flow/someAwesomeFlow"></share>')($rootScope);
      $rootScope.$digest();

      $timeout.flush(2000);

      element.triggerHandler('click');
      element.triggerHandler('$destroy');
      cancelTimeout.should.have.callCount(2);
    });

    it('should call select on popover click', function() {
      $compile('<share share-partial="flow/someAwesomeFlow"></share>')($rootScope);
      $rootScope.$digest();

      $timeout.flush(2000);

      var input = $document.find('input');
      var selectSpy = sandbox.spy(input[0], 'select');
      input.triggerHandler('click');
      selectSpy.should.have.callCount(3);
    });

    it('should call focus and select on element click', function() {
      var element = $compile('<share share-partial="flow/someAwesomeFlow"></share>')($rootScope);
      $rootScope.$digest();

      $timeout.flush(2000);

      var input = $document.find('input');
      var focusSpy = sandbox.spy(input[0], 'focus');
      var selectSpy = sandbox.spy(input[0], 'select');
      element.triggerHandler('click');
      $timeout.flush(20);

      focusSpy.should.have.callCount(1);
      selectSpy.should.have.callCount(1);
    });
  });
});