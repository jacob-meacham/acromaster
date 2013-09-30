var should = require('should');

var user = {
  name: 'foo'
};

describe('User', function() {
  it('should have a name', function(done) {
    user.should.have.property('name');
    done();
  });
});
