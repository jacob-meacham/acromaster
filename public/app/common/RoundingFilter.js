'use strict';

var SnapFilter = function() {
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  return function(number, base, precision) {
    base = base || 4;
    precision = precision || 2;

    if (!isNumeric(number)) {
      return number;
    }

    return (Math.round(number * base) / base).toFixed(precision);
  };
};

angular.module('acromaster.filters')
  .filter('snap', SnapFilter);