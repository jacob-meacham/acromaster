'use strict';

describe('ConfigService', function() {
  beforeEach(module('acromaster'));

  describe('Head Service', function() {
    var HeadService;
    beforeEach(inject(function(_HeadService_) {
      HeadService = _HeadService_;
    }));

    it('should start with sane defaults', function() {
      HeadService.getSiteName().should.eql('Acromaster');
      HeadService.getTitle().should.eql('Acromaster');
      HeadService.getDescription().should.eql('Acromaster');
      HeadService.getKeywords().should.eql('acrobatics');
    });

    it('should allow setting and resetting properties', function() {
      HeadService.setSiteName('New Name');
      HeadService.getSiteName().should.eql('New Name');
      HeadService.defaultSiteName();
      HeadService.getSiteName().should.eql('Acromaster');

      HeadService.setTitle('New Title');
      HeadService.getTitle().should.eql('New Title');

      HeadService.setDescription('New Description');
      HeadService.getDescription().should.eql('New Description');

      HeadService.setKeywords('new keywords');
      HeadService.getKeywords().should.eql('new keywords');
      HeadService.defaultKeywords();
      HeadService.getKeywords().should.eql('acrobatics');
    });
  });
});