'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

describe('Washing Machines', function() {
  it('should start with a washing machine', function(done) {
    browser.get('/washing-machine');
    expect(element(by.binding('move1.name')).getText()).to.eventually.exist;
    expect(element(by.binding('move2.name')).getText()).to.eventually.exist;
    expect(element(by.binding('washing_machine')).getText()).to.eventually.exist.notify(done);
  });
});