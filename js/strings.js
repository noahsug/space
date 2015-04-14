Strings = {
  Level: [
    'Home World',
    'Sagittarius',
    'Andromeda',
    'Maffei',
    'Dark World',
    'Cosmal'
  ],

  Boss: [
    'trainer',
    'dionysus',
    'tyche',
    'artemis',
    'hera',
    'nemesis'
  ],

  ItemType: {
    primary: 'attack',
    secondary: 'attack II',
    ability: 'ability',
    utility: 'specialty',
    augment: 'augment'
  },

  rank: function(level) {
    return Math.round((level / Game.MAX_LEVEL) * 9 + 1);
  }
};
