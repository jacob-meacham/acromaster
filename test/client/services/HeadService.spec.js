'use strict';

describe('ConfigService', function() {
  beforeEach(module('acromaster'));

  describe('Head Service', function() {
    var HeadService;
    beforeEach(inject(function(_HeadService_) {
      HeadService = _HeadService_;
    }));

    it('should start with sane defaults', function() {
      HeadService.siteName.should.eql('Acromaster');
      HeadService.title.should.eql('Acromaster');
      HeadService.description.should.eql('Acromaster');
      HeadService.keywords.should.eql('acrobatics');
    });

    it('should allow setting and resetting properties', function() {
      HeadService.setSiteName('New Name');
      HeadService.siteName.should.eql('New Name');
      HeadService.defaultSiteName();
      HeadService.siteName.should.eql('Acromaster');

      HeadService.setTitle('New Title');
      HeadService.title.should.eql('New Title');

      HeadService.setDescription('New Description');
      HeadService.description.should.eql('New Description');

      HeadService.setKeywords('new keywords');
      HeadService.keywords.should.eql('new keywords');
      HeadService.defaultKeywords();
      HeadService.keywords.should.eql('acrobatics');
    });
  });
});