'use strict';

var directives = angular.module('acromaster.directives');

directives.directive('navMenu', ['$location', function($location) {
  return function(scope, element, attrs) {
    var links = element.find('a'),
        elements = element.find('li'),
        activeClass = attrs.navMenu || 'active',
        link,
        url,
        currentLink,
        urlMap = {},
        i;

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

    for (i = 0; i < links.length; i++) {
      link = angular.element(links[i]);
      url = link.attr('href');
      urlMap[url] = angular.element(elements[i]);
    }

    setActiveLink();

    scope.$on('$routeChangeStart', function() {
      setActiveLink();
    });
  };
}]);