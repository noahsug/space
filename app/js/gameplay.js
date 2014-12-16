di.constant('gameplayFile', {
  init: {
    player: [
      //'burst laser',
      //'grenade',
      'razors',
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
        'health II',
        'circle',
        '+health'
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
      type: 'primary.laser', spec: {},
      level: 0},
    'shotgun': {
      desc: 'Fires a powerful burst of shots in an arc.',
      type:'primary.shotgun', spec: {},
      level: 0},
    'grenade': {
      desc: 'Travels a short distance before exploding in a large area.',
      type:'primary.grenade', spec: {},
      level: 0},
    'razors': {
      desc: 'Fires three powerful shots in three directions.',
      type:'primary.razors', spec: {},
      level: 0},

    'stun': {
      desc: 'Shot that stuns the enemy on contact.',
      type:'secondary.stun', spec: {},
      level: 0},
    'ram': {
      desc: 'Ram your enemies for massive damage.',
      type:'secondary.ram', spec: {},
      level: 0},
    'emp': {
      desc: 'Grenade that disables enemy primary weapons.',
      type:'secondary.emp', spec: {},
      level: 0},
    'repair': {
      desc: 'Repairs damage to your ship.',
      type:'secondary.heal', spec: {},
      level: 0},

    'baboon': {
      desc: 'Enrage when hurt, becoming larger and dealing more damage.',
      type: 'ability.rage', spec: {},
      level: 1},
    'mink': {
      desc: 'Small and agile, but deal less damage.',
      type: 'ability.tiny', spec: {},
      level: 1},
    'mosquito': {
      desc: 'Low health but repair by dealing damage.',
      type: 'ability.lifesteal', spec: {},
      level: 1},
    'elephant': {
      desc: 'Move slower and take less damage.',
      type: 'ability.armor', spec: {},
      level: 1},
    'spider': {
      desc: 'Take more damage and slow the enemy on each hit.',
      type: 'ability.slow', spec: {},
      level: 1},

    'teleport': {
      desc: 'Teleport to a random location to avoid enemy projectiles.',
      type: 'utility.teleport', spec: {cooldown: 4},
      level: 1},
    'invisible': {
      desc: 'Become untargetable for a short period of time.',
      type: 'utility.invisible', spec: {cooldown: 4},
      level: 1},
    'propane': {
      desc: 'Gain a massive boost of speed for a short period of time.',
      type: 'utility.propane', spec: {cooldown: 4},
      level: 1},
    'zombie': {
      desc: 'Stay alive for a few seconds after death.',
      type: 'utility.zombie', spec: {cooldown: 4},
      level: 1},

    '+health': {
      desc: '20% more health.',
      type: 'mod.health', spec: {health: 1.2}},
    '+speed': {
      desc: 'Move 20% faster.',
      type: 'mod.speed', spec: {speed: 1.2}},
    '+attack rate': {
      desc: 'Attack 20% faster.',
      type: 'mod.primaryCooldown', spec: {cooldown: 5 / 6}},
    '+explosion size': {
      desc: '20% larger explosions.',
      type: 'mod.aoe', spec: {radius: 1.2}},
    '+disable': {
      desc: 'Stuns, slows and disables last 20% longer.',
      type: 'mod.disable', spec: {duration: 1.2}},

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
      type: 'shape.circle', spec: {radius: 12}},

    'health I': {
      desc: '20 health',
      type: 'health', spec: {health: 20}},
    'health II': {
      desc: '25 health',
      type: 'health', spec: {health: 25}}
  }
});
