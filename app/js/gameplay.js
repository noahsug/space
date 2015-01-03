/**
 * Movement should be listed LAST so targeting is consistant.
 */

di.constant('gameplayFile', {
  init: {
    player: [
      //'basic laser',
      //'burst laser',
      //'grenade',
      //'razors',
      //'sniper',
      'stun',
      //'emp',
      //'shotgun',
      'health II',
      'circle',
      '+explosion size',
      'baboon',
      'speed I',
    ],

    inventory: [
      'shotgun',
      'teleport',
      'burst laser'
    ]
  },

  level: [
    {
      enemy: [
        //'shotgun',
        'sniper',
        //'basic laser',
        'dash',
        'health II',
        'circle',
        //'+health',
        'speed II',
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
    'basic laser': {
      desc: 'Basic laser weapon.',
      type: 'primary.basicLaser', spec: {},
      level: 0},
    'burst laser': {
      desc: 'Fires a rapid volley of shots every 2 seconds.',
      type: 'primary.burstLaser', spec: {},
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
    'sniper': {
      desc: 'Fires a fast, powerful shot.',
      type:'primary.sniper', spec: {},
      level: 1},

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
      type: 'ability.mink', spec: {},
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

    'dash': {
      desc: 'dash.',
      type: 'utility.dash', spec: {},
      level: 1},
    'teleport': {
      desc: 'Teleport to a random location to avoid enemy projectiles.',
      type: 'utility.teleport', spec: {cooldown: 6},
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


    // Non-collectables.

    'radial I': {
      desc: 'Move in a circle around the enemy.',
      type:'movement.radial', spec: {speed: 70},
      level: 0},
    'radial II': {
      desc: 'Move in a circle around the enemy.',
      type:'movement.radial', spec: {speed: 135},
      level: 1},
    'speed I': {
      desc: '135 speed',
      type:'movement.ai', spec: {speed: 110},
      level: 0},
    'speed II': {
      desc: '135 speed',
      type:'movement.ai', spec: {speed: 120},
      level: 0},

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
