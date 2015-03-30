'use strict';

/* exported Audio */
// Mock out Audio() for PhantomJS
// TODO: Only do this when running against Phantom
function Audio() {
  return {
    play: function() {
      this.paused = false;
    },
    pause: function() {
      this.paused = true;
    },
    paused: true
  };
}