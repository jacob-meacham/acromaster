'use strict';

describe('HeadController', function() {
  beforeEach(module('acromaster'));

  var $controller;
  var HeadService;

  beforeEach(inject(function(_$controller_, _HeadService_) {
    $controller = _$controller_;
    HeadService = _HeadService_;
  }));

  it('should start with the Head Service defaults', function() {
    var $scope = {};
    $controller('PageController', { $scope: $scope, HeadService: HeadService });

    $scope.pageHeader.siteName.should.eql(HeadService.siteName);
    $scope.pageHeader.title.should.eql(HeadService.title);
    $scope.pageHeader.description.should.eql(HeadService.description);
    $scope.pageHeader.keywords.should.eql(HeadService.keywords);
  });

  it('should update when the service values update', function() {
    var $scope = {};
    $controller('PageController', { $scope: $scope });

    HeadService.setSiteName('new site name');
    HeadService.setTitle('new title');
    HeadService.setDescription('new description');
    HeadService.setKeywords('new keywords');

    $scope.pageHeader.siteName.should.eql(HeadService.siteName);
    $scope.pageHeader.title.should.eql(HeadService.title);
    $scope.pageHeader.description.should.eql(HeadService.description);
    $scope.pageHeader.keywords.should.eql(HeadService.keywords);
  });
});