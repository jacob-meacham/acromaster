'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

describe('Washing Machines', function() {
  beforeEach(function() {
    browser.get('/washing-machine');
  });

  it('should start with a washing machine', function(done) {
    expect(element(by.binding('move1.name')).getText()).to.eventually.exist;
    expect(element(by.binding('move2.name')).getText()).to.eventually.exist;
    expect(element(by.binding('washing_machine')).getText()).to.eventually.exist.notify(done);
  });

  it('should generate a new washing machine', function(done) {
    var initialWashingMachine;
    element(by.binding('washing_machine')).getText().then(function(text) {
      initialWashingMachine = text;
      $('.btn').click();
    }).then(function() {
      expect(element(by.binding('washing_machine')).getText()).to.eventually.not.equal(initialWashingMachine).notify(done);
    });
  });
});