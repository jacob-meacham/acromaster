'use strict';

describe('PageHeaderController', function() {
  beforeEach(module('acromaster'));

  var $controller;
  var PageHeaderService;

  beforeEach(inject(function(_$controller_, _PageHeaderService_) {
    $controller = _$controller_;
    PageHeaderService = _PageHeaderService_;
  }));

  it('should start with the Head Service defaults', function() {
    var vm = $controller('PageHeaderController');

    vm.header.siteName.should.eql(PageHeaderService.siteName);
    vm.header.title.should.eql(PageHeaderService.title);
    vm.header.description.should.eql(PageHeaderService.description);
    vm.header.keywords.should.eql(PageHeaderService.keywords);
  });

  it('should update when the service values update', function() {
    var vm = $controller('PageHeaderController');

    PageHeaderService.setSiteName('new site name');
    PageHeaderService.setTitle('new title');
    PageHeaderService.setDescription('new description');
    PageHeaderService.setKeywords('new keywords');

    vm.header.siteName.should.eql(PageHeaderService.siteName);
    vm.header.title.should.eql(PageHeaderService.title);
    vm.header.description.should.eql(PageHeaderService.description);
    vm.header.keywords.should.eql(PageHeaderService.keywords);
  });
});