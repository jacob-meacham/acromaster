'use strict';

var navMenu = function($location) {
  return {
    link: function(scope, element, attrs) {
      var links = element.find('a');
      var elements = element.find('li');
      var activeClass = attrs.navMenu || 'active';
      var currentLink;
      var urlMap = [];

      var setActiveLink = function() {
        if (currentLink) {
          currentLink.removeClass(activeClass);
        }

        console.log($location);

        var pathLink;
        for (var i = 0; i < urlMap.length; i++) {
          if ($location.path().startsWith(urlMap[i].base)) {
            pathLink = urlMap[i].element;
            break;
          }
        }

        if (pathLink) {
          currentLink = pathLink;
          currentLink.addClass(activeClass);
        }
      };

      for (var i = 0; i < links.length; i++) {
        var link = angular.element(links[i]);
        var url = link.attr('href');
        urlMap.push({base: url, element: angular.element(elements[i])});
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
