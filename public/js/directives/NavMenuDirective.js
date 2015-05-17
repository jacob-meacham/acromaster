'use strict';

var navMenu = function($location) {
  return {
    link: function(scope, element, attrs) {
      var links = element.find('a');
      var elements = element.find('li');
      var activeClass = attrs.navMenu || 'active';
      var currentLink;
      var urlMap = {};

      var setActiveLink = function() {
        var pathLink = urlMap[$location.path()];

        if (pathLink) {
          if (currentLink) {
            currentLink.removeClass(activeClass);
          }
          currentLink = pathLink;
          currentLink.addClass(activeClass);
        }
      };

      for (var i = 0; i < links.length; i++) {
        var link = angular.element(links[i]);
        var url = link.attr('href');
        urlMap[url] = angular.element(elements[i]);
      }

      setActiveLink();

      scope.$on('$routeChangeStart', function() {
        setActiveLink();
      });
    }
  };
};

angular.module('acromaster.directives')
  .directive('navMenu', ['$location', navMenu]);
