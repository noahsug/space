di.constant('gameplayFile', {
  init: {
    player: [
      'burst laser',
      'radial II',
      'health II',
      'circle'
    ],

    inventory: [
      'shotgun',
      'teleport',
      'burst laser',
      'radial II',
    ]
  },

  level: [
    {
      enemy: [
        'shotgun',
        'teleport',
        'radial I',
        'health I',
        'circle'
      ]
    },
    {
      enemy: [
        'shotgun',
        'burst laser',
        'radial I',
        'health I',
        'circle'
      ]
    }
  ],

  items: {
    'burst laser': {
      desc: 'Fires a rapid volley of shots every 2 seconds.',
      type: 'weapon.laser', spec: {},
      level: 0},
    'shotgun': {
      desc: 'Fires a powerful burst of shots in an arc.',
      type:'weapon.shotgun', spec: {},
      level: 0},

    'teleport': {
      desc: 'Teleport to a random location to avoid enemy projectiles.',
      type: 'power.teleport', spec: {cooldown: 2},
      level: 1},

    'radial I': {
      desc: 'Move in a circle around the enemy.',
      type:'movement.radial', spec: {speed: 100},
      level: 0},
    'radial II': {
      desc: 'Move in a circle around the enemy.',
      type:'movement.radial', spec: {speed: 135},
      level: 1},

    'circle': {
      desc: 'Circle',
      type: 'shape.circle', spec: {radius: 10}},

    'health I': {
      desc: '20 health',
      type: 'health', spec: {health: 1}},
    'health II': {
      desc: '25 health',
      type: 'health', spec: {health: 25}}
  }
});
