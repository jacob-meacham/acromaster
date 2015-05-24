'use strict';

describe('Page Header Service', function() {
  beforeEach(module('acromaster'));

  var PageHeaderService;
  beforeEach(inject(function(_PageHeaderService_) {
    PageHeaderService = _PageHeaderService_;
  }));

  it('should start with sane defaults', function() {
    PageHeaderService.siteName.should.eql('Acromaster');
    PageHeaderService.title.should.eql('Acromaster');
    PageHeaderService.description.should.eql('Acromaster');
    PageHeaderService.keywords.should.eql('acrobatics');
  });

  it('should allow setting and resetting properties', function() {
    PageHeaderService.setSiteName('New Name');
    PageHeaderService.siteName.should.eql('New Name');
    PageHeaderService.defaultSiteName();
    PageHeaderService.siteName.should.eql('Acromaster');

    PageHeaderService.setTitle('New Title');
    PageHeaderService.title.should.eql('Acromaster - New Title');
    PageHeaderService.setTitle();
    PageHeaderService.title.should.eql('Acromaster');

    PageHeaderService.setDescription('New Description');
    PageHeaderService.description.should.eql('New Description');

    PageHeaderService.setKeywords('new keywords');
    PageHeaderService.keywords.should.eql('new keywords');
    PageHeaderService.defaultKeywords();
    PageHeaderService.keywords.should.eql('acrobatics');
  });
});