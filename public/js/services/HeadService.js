'use strict';
var acromasterServices = angular.module('acromaster.services');

acromasterServices.factory('HeadService', [function() {
  var siteName = 'Acromaster';
  var title = 'Acromaster';
  var description = 'Acromaster';
  var keywords = 'acrobatics';
  return {
    siteName: siteName,

    setSiteName: function(_siteName) {
      siteName = _siteName;
    },

    defaultSiteName: function() {
      siteName = 'Acromaster';
    },

    title: title,

    setTitle: function(_title) {
      title = _title;
    },

    description: description,

    setDescription: function(_description) {
      description = _description;
    },

    keywords: keywords,

    setKeywords: function(_keywords) {
      keywords = _keywords;
    },

    defaultKeywords: function() {
      keywords = 'acrobatics sports';
    }
  };
}]);