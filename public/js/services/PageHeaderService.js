'use strict';

var PageHeaderService = function() {
  this.siteName = 'Acromaster';
  this.title = 'Acromaster';
  this.description = 'Acromaster';
  this.keywords = 'acrobatics';

  this.setSiteName = function(_siteName) {
    this.siteName = _siteName;
  };

  this.defaultSiteName = function() {
    this.siteName = 'Acromaster';
  };

  this.setTitle = function(_title) {
    this.title = _title;
  };

  this.setDescription = function(_description) {
    this.description = _description;
  };

  this.setKeywords = function(_keywords) {
    this.keywords = _keywords;
  };

  this.defaultKeywords = function() {
    this.keywords = 'acrobatics';
  };

  return this;
};

angular.module('acromaster.services')
  .service('PageHeaderService', PageHeaderService);
