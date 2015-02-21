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
    'pistol',
    //'knockback',
    //'charge',
    //'tracker',

    //'teleport',

    //'shield',
    //'reflect',
    //'haze',
    //'invisible',
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
      //'shotgun',
      //'missiles',
      'pistol',
      'split',
      'circle',
    ],
    [
      'razors',
      'turtle',
      '+defence',
      'circle',
    ],
    [
      'grenade',
      'emp',
      'baboon II',
      '+explosions',
      'circle',
    ],
    [
      'sniper',
      'pistol II',
      'mink',
      'dash II',
      '+speed II',
      'circle',
    ],
    [
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
      id: 'primary.basicLaser', spec: {},
      level: 0},
    'basic laser II': {
      desc: 'Basic laser weapon.',
      id: 'primary.basicLaser', spec: {power: 1},
      level: 1},
    'basic laser III': {
      desc: 'Basic laser weapon.',
      id: 'primary.basicLaser', spec: {power: 2},
      level: 2},
    'burst laser': {
      desc: 'Fires a rapid volley of shots every 2 seconds.',
      id: 'primary.burstLaser', spec: {},
      level: 1},
    'burst laser II': {
      desc: 'Fires a rapid volley of shots every 2 seconds.',
      id: 'primary.burstLaser', spec: {power: 1},
      level: 2},
    'shotgun': {
      desc: 'Fires a powerful burst of shots in an arc.',
      id:'primary.shotgun', spec: {},
      level: 0},
    'shotgun II': {
      desc: 'Fires a powerful burst of shots in an arc.',
      id:'primary.shotgun', spec: {power: 1},
      level: 1},
    'shotgun III': {
      desc: 'Fires a powerful burst of shots in an arc.',
      id:'primary.shotgun', spec: {power: 2},
      level: 2},
    'grenade': {
      desc: 'Travels a short distance before exploding in a large area.',
      id:'primary.grenade', spec: {},
      level: 0},
    'razors': {
      desc: 'Fires three powerful shots in three directions.',
      id:'primary.razors', spec: {},
      level: 1},
    'sniper': {
      desc: 'Fires a fast, powerful shot.',
      id:'primary.sniper', spec: {},
      level: 1},
    'missiles': {
      desc: 'Fires seeking shots.',
      id:'primary.missiles', spec: {},
      level: 1},
    'missiles II': {
      desc: 'Fires seeking shots.',
      id:'primary.missiles', spec: {power: 1},
      level: 2},

    'stun': {
      desc: 'Shot that stuns the enemy on contact.',
      id:'secondary.stun', spec: {},
      level: 0},
    'stun II': {
      desc: 'Shot that stuns the enemy on contact.',
      id:'secondary.stun', spec: {power: 1},
      level: 1},
    'emp': {
      desc: 'Grenade that disables enemy primary weapons.',
      id:'secondary.emp', spec: {},
      level: 1},
    'emp II': {
      desc: 'Grenade that disables enemy primary weapons.',
      id:'secondary.emp', spec: {power: 1},
      level: 2},
    'pistol': {
      desc: 'Basic laser.',
      id:'secondary.pistol', spec: {},
      level: 0},
    'pistol II': {
      desc: 'Basic laser.',
      id:'secondary.pistol', spec: {power: 1},
      level: 1},
    'pistol III': {
      desc: 'Basic laser.',
      id:'secondary.pistol', spec: {power: 2},
      level: 2},
    'knockback': {
      desc: '',
      id:'secondary.knockback', spec: {},
      level: 1},
    'charge': {
      desc: '',
      id:'secondary.charge', spec: {},
      level: 1},
    'tracker': {
      desc: '',
      id:'secondary.tracker', spec: {},
      level: 1},

    'dash': {
      desc: 'dash.',
      id: 'utility.dash', spec: {},
      level: 0},
    'dash II': {
      desc: 'dash.',
      id: 'utility.dash', spec: {power: 1},
      level: 1},
    'dash III': {
      desc: 'dash.',
      id: 'utility.dash', spec: {power: 2},
      level: 2},
    'teleport': {
      desc: 'Teleport behind the enemy.',
      id: 'utility.teleport', spec: {},
      level: 1},
    'teleport II': {
      desc: 'Teleport behind the enemy.',
      id: 'utility.teleport', spec: {power: 1},
      level: 2},
    //'turbo': {
    //  desc: 'move faster.',
    //  id: 'utility.turbo', spec: {},
    //  level: 9},
    //'invisible': {
    //  desc: 'Become untargetable for a short period of time.',
    //  id: 'utility.invisible', spec: {cooldown: 4},
    //  level: 9},

    'split': {
      desc: '',
      id: 'ability.split', spec: {},
      level: 0},
    'invisible': {
      desc: '',
      id: 'ability.invisible', spec: {},
      level: 0},
    'haze': {
      desc: '',
      id: 'ability.haze', spec: {},
      level: 0},
    'shield': {
      desc: '',
      id: 'ability.shield', spec: {},
      level: 0},
    'reflect': {
      desc: '',
      id: 'ability.reflect', spec: {},
      level: 0},
    'baboon': {
      desc: 'Enrage when hurt, becoming larger and dealing more damage.',
      id: 'ability.rage', spec: {},
      level: 0},
    'baboon II': {
      desc: 'Enrage when hurt, becoming larger and dealing more damage.',
      id: 'ability.rage', spec: {power: 1},
      level: 1},
    'baboon III': {
      desc: 'Enrage when hurt, becoming larger and dealing more damage.',
      id: 'ability.rage', spec: {power: 1},
      level: 2},
    'mink': {
      desc: 'Small and agile, but deal less damage.',
      id: 'ability.mink', spec: {},
      level: 1},
    //'zombie': {
    //  desc: 'Stay alive for a few seconds after death.',
    //  id: 'ability.zombie', spec: {cooldown: 4},
    //  level: 9},

    '+health': {
      desc: '20% more health.',
      id: 'mod.health', spec: {health: 1.18},
      level: 0},
    '+health II': {
      desc: '20% more health.',
      id: 'mod.health', spec: {health: 1.27},
      level: 1},
    '+health III': {
      desc: '20% more health.',
      id: 'mod.health', spec: {health: 1.36},
      level: 2},
    '+defence': {
      desc: '20% more def.',
      id: 'mod.def', spec: {def: 1.2},
      level: 1},
    '+speed': {
      desc: 'Move 20% faster.',
      id: 'mod.speed', spec: {speed: 1.3},
      level: 0},
    '+speed II': {
      desc: 'Move 20% faster.',
      id: 'mod.speed', spec: {speed: 1.5},
      level: 1},
    '+attack rate': {
      desc: 'Attack 20% faster.',
      id: 'mod.primaryCooldown', spec: {cooldown: 5 / 6},
      level: 1},
    '+attack rate II': {
      desc: 'Attack 20% faster.',
      id: 'mod.primaryCooldown', spec: {cooldown: 4 / 6},
      level: 2},
    '+explosions': {
      desc: '20% larger explosions.',
      id: 'mod.aoe', spec: {radius: 1.2},
      level: 0},
    '+disable': {
      desc: 'Stuns, slows and disables last 20% longer.',
      id: 'mod.disable', spec: {duration: 1.2},
      level: 1},

    // Non-collectables.

    'circle': {
      desc: 'Circle',
      id: 'shape.circle', spec: {radius: 12}}
  }
});
