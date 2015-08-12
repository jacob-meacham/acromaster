'use strict';

describe('FooterController', function() {
  beforeEach(module('acromaster'));

  var sandbox;
  
  var $controller;
  var $modal;

  beforeEach(inject(function(_$controller_, _$modal_) {
    $controller = _$controller_;
    $modal = _$modal_;

    sandbox = sinon.sandbox.create();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('should open the About modal', function() {
    var openStub = sandbox.stub($modal, 'open');

    var vm = $controller('FooterController');

    vm.about();
    openStub.should.have.callCount(1);
    var openCall = openStub.getCall(0);
    openCall.args[0].controller.should.eql('AboutController as vm');
  });
});
