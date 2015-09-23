'use strict';

// Because testable code is the best, and why not?
var AchievementsService = function(_) {
  var achievementsData = {
    // # of flows
    firsttimer : {
      title: 'First Timer',
      description: 'Complete your first flow',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },
    flowhero : {
      title: 'Flow Hero',
      description: 'Complete ten flows',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },
    lesinge: {
      title: 'Le Singe',
      description: 'Complete 100 flows (you monkey!)',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },
    acromaster : {
      title: 'Acromaster',
      description: 'Complete 1000 flows',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },

    // # of minutes played
    gettingwarmedup : {
      title: 'Just Getting Warmed Up',
      description: 'Play Acromaster for ten minutes',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },
    acrolific : {
      title: 'Acrolific',
      description: 'Play 100 minutes of Acromaster',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },
    acrofanatic : {
      title: 'Acro Fanatic',
      description: 'Play 500 minutes of Acromaster',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },
    goldstar : {
      title: 'Gold Star Alliance',
      description: 'Log 1000 minutes of flow time',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },
    flownforaweek : {
      title: 'Flown for a Week',
      description: 'Log 10,000 minutes of flow time',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },

    // # of moves done
    fistfulofacro : {
      title: 'A Fistful of Acro',
      description: 'Perform 100 poses',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },
    neverseenthatone : {
      title: 'Huh, Never Seen That One Before',
      description: 'Perform 1000 poses',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },
    allthemoves : {
      title: 'All. The. Moves',
      description: 'Do a total of 10,000 poses',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },

    // Length of flow
    acroquickie : {
      title: 'Acro Quickie',
      description: 'Complete a flow that is at least 10 minutes long',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },
    hourwellspent : {
      title: 'Well, That Was an Hour Well Spent',
      description: 'Complete a flow that is at least an hour long',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },
    unendingendurance : {
      title: 'Unending Endurance',
      description: 'Complete a flow that is at least 90 minutes long',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },

    // # of flows written
    riteofpassage : {
      title: 'Rite of Passage',
      description: 'Publish your first flow',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },
    acroauteur : {
      title: 'Acro Auteur',
      description: 'Publish at least 10 flows',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    },
    rlstine : {
      title: 'The R.L. Stine of Acro',
      description: 'Publish at least 100 flows',
      image: '{fa:true, "fa-trophy":true, "fa-2x":true}'
    }
  };

  var setStepBasedAchievements = function(achievements, steps, value) {
    steps.forEach(function(step) {
      if(value >= step.val) {
        achievements[step.key].awarded = true;
      }
    });
  };

  return {
    getUserAchievements: function(user) {
      var achievements = _.mapValues(_.cloneDeep(achievementsData), function(value) {
        value.awarded = false;
        return value;
      });

      // # of flows
      setStepBasedAchievements(achievements, [{key: 'firsttimer', val: 1}, {key: 'flowhero', val: 10}, {key: 'lesinge', val: 100}, {key: 'acromaster', val: 1000}], user.stats.flowsPlayed);

      // # of minutes played
      var timeSteps = [{key: 'gettingwarmedup', val: 10}, {key: 'acrolific', val: 100}, {key: 'acrofanatic', val: 500}, {key: 'goldstar', val: 1000}, {key: 'flownforaweek', val: 10000}];
      setStepBasedAchievements(achievements, timeSteps, user.stats.secondsPlayed / 60);

      // # of moves done
      setStepBasedAchievements(achievements, [{key: 'fistfulofacro', val: 100}, {key: 'neverseenthatone', val: 1000}, {key: 'allthemoves', val: 10000}], user.stats.moves);

      // # longest flow
      setStepBasedAchievements(achievements, [{key: 'acroquickie', val: 600}, {key: 'hourwellspent', val: 3600}, {key: 'unendingendurance', val: 5400}], user.stats.longestFlow);
      
      // # of flows written
      setStepBasedAchievements(achievements, [{key: 'riteofpassage', val: 1}, {key: 'acroauteur', val: 10}, {key: 'rlstine', val: 100}], user.stats.flowsWritten);
      

      return _.map(achievements, function(value) {
        return value;
      });
    },

    getAchievements: function() {
      return achievementsData;
    }
  };
};

angular.module('acromaster.services')
  .factory('AchievementsService', ['_', AchievementsService]);
