'use strict';
var acromasterServices = angular.module('acromaster.services');

acromasterServices.factory('HeadService', [function() {
  var siteName = 'Acromaster';
  var title = 'Acromaster';
  var description = 'Acromaster';
  var keywords = 'acrobatics';
  return {
    getSiteName: function() {
      return siteName;
    },

    setSiteName: function(_siteName) {
      siteName = _siteName;
    },

    defaultSiteName: function() {
      siteName = 'Acromaster';
    },

    getTitle: function() {
      return title;
    },

    setTitle: function(_title) {
      title = _title;
    },

    getDescription: function() {
      return description;
    },

    setDescription: function(_description) {
      description = _description;
    },

    getKeywords: function() {
      return keywords;
    },

    setKeywords: function(_keywords) {
      keywords = _keywords;
    },

    defaultKeywords: function() {
      keywords = 'acrobatics';
    }
  };
}]);