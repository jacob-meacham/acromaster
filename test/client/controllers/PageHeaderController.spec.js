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
    var $scope = {};
    $controller('PageHeaderController', { $scope: $scope, PageHeaderService: PageHeaderService });

    $scope.pageHeader.siteName.should.eql(PageHeaderService.siteName);
    $scope.pageHeader.title.should.eql(PageHeaderService.title);
    $scope.pageHeader.description.should.eql(PageHeaderService.description);
    $scope.pageHeader.keywords.should.eql(PageHeaderService.keywords);
  });

  it('should update when the service values update', function() {
    var $scope = {};
    $controller('PageHeaderController', { $scope: $scope });

    PageHeaderService.setSiteName('new site name');
    PageHeaderService.setTitle('new title');
    PageHeaderService.setDescription('new description');
    PageHeaderService.setKeywords('new keywords');

    $scope.pageHeader.siteName.should.eql(PageHeaderService.siteName);
    $scope.pageHeader.title.should.eql(PageHeaderService.title);
    $scope.pageHeader.description.should.eql(PageHeaderService.description);
    $scope.pageHeader.keywords.should.eql(PageHeaderService.keywords);
  });
});