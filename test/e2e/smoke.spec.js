'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

describe('smoke test', function() {
  beforeEach(function() {
    this.slow(6000);
  });

  it('should load', function(done) {
    browser.get('/');
    expect(browser.getTitle()).to.eventually.equal('Acromaster - Test').notify(done);
  });
});