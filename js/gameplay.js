var Gameplay = di.service('Gameplay', ['GameplayParser', 'gameplayFile']);

Gameplay.prototype.init = function() {
  this.gameplayParser_.parse(this.gameplayFile_, this);
};

di.constant('gameplayFile', {
  player: [
    'basic laser',
    //'burst laser',
    //'grenade',
    //'razors',
    //'sniper',
    //'missiles',
    //'shotgun',

    //'stun',
    //'emp',
    //'pistol',

    //'teleport',

    //'mink',
    //'baboon',

    //'+explosions',

    'circle'
  ],

  inventory: [
    'basic laser',
  ],

  bosses: [
    [
      'boss1',
      'shotgun',
      'pistol',
      'circle',
    ],
    [
      'boss2',
      'razors',
      'turtle',
      '+defence',
      'circle',
    ],
    [
      'boss3',
      'grenade',
      'emp',
      'baboon II',
      '+explosions',
      'circle',
    ],
    [
      'boss4',
      'sniper',
      'pistol II',
      'mink',
      'dash II',
      '+speed II',
      'circle',
    ],
    [
      'boss5',
      'missiles II',
      'teleport',
      '+attack rate II',
      'baboon III',
      'stun',
      'circle',
    ],
  ],

  items: {
    'basic laser': {
      desc: 'Basic laser weapon.',
      type: 'primary.basicLaser', spec: {},
      level: 0},
    'basic laser II': {
      desc: 'Basic laser weapon.',
      type: 'primary.basicLaser', spec: {power: 1},
      level: 1},
    'basic laser III': {
      desc: 'Basic laser weapon.',
      type: 'primary.basicLaser', spec: {power: 2},
      level: 2},
    'burst laser': {
      desc: 'Fires a rapid volley of shots every 2 seconds.',
      type: 'primary.burstLaser', spec: {},
      level: 1},
    'burst laser II': {
      desc: 'Fires a rapid volley of shots every 2 seconds.',
      type: 'primary.burstLaser', spec: {power: 1},
      level: 2},
    'shotgun': {
      desc: 'Fires a powerful burst of shots in an arc.',
      type:'primary.shotgun', spec: {},
      level: 0},
    'shotgun II': {
      desc: 'Fires a powerful burst of shots in an arc.',
      type:'primary.shotgun', spec: {power: 1},
      level: 1},
    'shotgun III': {
      desc: 'Fires a powerful burst of shots in an arc.',
      type:'primary.shotgun', spec: {power: 2},
      level: 2},
    'grenade': {
      desc: 'Travels a short distance before exploding in a large area.',
      type:'primary.grenade', spec: {},
      level: 0},
    'razors': {
      desc: 'Fires three powerful shots in three directions.',
      type:'primary.razors', spec: {},
      level: 1},
    'sniper': {
      desc: 'Fires a fast, powerful shot.',
      type:'primary.sniper', spec: {},
      level: 1},
    'missiles': {
      desc: 'Fires seeking shots.',
      type:'primary.missiles', spec: {},
      level: 1},
    'missiles II': {
      desc: 'Fires seeking shots.',
      type:'primary.missiles', spec: {power: 1},
      level: 2},

    'stun': {
      desc: 'Shot that stuns the enemy on contact.',
      type:'secondary.stun', spec: {},
      level: 0},
    'stun II': {
      desc: 'Shot that stuns the enemy on contact.',
      type:'secondary.stun', spec: {power: 1},
      level: 1},
    'emp': {
      desc: 'Grenade that disables enemy primary weapons.',
      type:'secondary.emp', spec: {},
      level: 1},
    'emp II': {
      desc: 'Grenade that disables enemy primary weapons.',
      type:'secondary.emp', spec: {power: 1},
      level: 2},
    'pistol': {
      desc: 'Basic laser.',
      type:'secondary.pistol', spec: {},
      level: 0},
    'pistol II': {
      desc: 'Basic laser.',
      type:'secondary.pistol', spec: {power: 1},
      level: 1},
    'pistol III': {
      desc: 'Basic laser.',
      type:'secondary.pistol', spec: {power: 2},
      level: 2},

    'dash': {
      desc: 'dash.',
      type: 'utility.dash', spec: {},
      level: 0},
    'dash II': {
      desc: 'dash.',
      type: 'utility.dash', spec: {power: 1},
      level: 1},
    'dash III': {
      desc: 'dash.',
      type: 'utility.dash', spec: {power: 2},
      level: 2},
    'teleport': {
      desc: 'Teleport behind the enemy.',
      type: 'utility.teleport', spec: {},
      level: 1},
    'teleport II': {
      desc: 'Teleport behind the enemy.',
      type: 'utility.teleport', spec: {power: 1},
      level: 2},
    //'turbo': {
    //  desc: 'move faster.',
    //  type: 'utility.turbo', spec: {},
    //  level: 9},
    //'invisible': {
    //  desc: 'Become untargetable for a short period of time.',
    //  type: 'utility.invisible', spec: {cooldown: 4},
    //  level: 9},

    'baboon': {
      desc: 'Enrage when hurt, becoming larger and dealing more damage.',
      type: 'ability.rage', spec: {},
      level: 0},
    'baboon II': {
      desc: 'Enrage when hurt, becoming larger and dealing more damage.',
      type: 'ability.rage', spec: {power: 1},
      level: 1},
    'baboon III': {
      desc: 'Enrage when hurt, becoming larger and dealing more damage.',
      type: 'ability.rage', spec: {power: 1},
      level: 2},
    'mink': {
      desc: 'Small and agile, but deal less damage.',
      type: 'ability.mink', spec: {},
      level: 1},
    'turtle': {
      desc: 'High def, low speed.',
      type: 'ability.turtle', spec: {},
      level: 0},
    //'zombie': {
    //  desc: 'Stay alive for a few seconds after death.',
    //  type: 'ability.zombie', spec: {cooldown: 4},
    //  level: 9},

    '+health': {
      desc: '20% more health.',
      type: 'mod.health', spec: {health: 1.18},
      level: 0},
    '+health II': {
      desc: '20% more health.',
      type: 'mod.health', spec: {health: 1.27},
      level: 1},
    '+health III': {
      desc: '20% more health.',
      type: 'mod.health', spec: {health: 1.36},
      level: 2},
    '+defence': {
      desc: '20% more def.',
      type: 'mod.def', spec: {def: 1.2},
      level: 1},
    '+speed': {
      desc: 'Move 20% faster.',
      type: 'mod.speed', spec: {speed: 1.3},
      level: 0},
    '+speed II': {
      desc: 'Move 20% faster.',
      type: 'mod.speed', spec: {speed: 1.5},
      level: 1},
    '+attack rate': {
      desc: 'Attack 20% faster.',
      type: 'mod.primaryCooldown', spec: {cooldown: 5 / 6},
      level: 1},
    '+attack rate II': {
      desc: 'Attack 20% faster.',
      type: 'mod.primaryCooldown', spec: {cooldown: 4 / 6},
      level: 2},
    '+explosions': {
      desc: '20% larger explosions.',
      type: 'mod.aoe', spec: {radius: 1.2},
      level: 0},
    '+disable': {
      desc: 'Stuns, slows and disables last 20% longer.',
      type: 'mod.disable', spec: {duration: 1.2},
      level: 1},

    // Non-collectables.

    'circle': {
      desc: 'Circle',
      type: 'shape.circle', spec: {radius: 12}},

    'boss1': {
      type: 'stats', spec: {health: 10}},

    'boss2': {
      type: 'stats', spec: {health: 16}},

    'boss3': {
      type: 'stats', spec: {health: 24}},

    'boss4': {
      type: 'stats', spec: {health: 36}},

    'boss5': {
      type: 'stats', spec: {health: 50}}
  }
});
