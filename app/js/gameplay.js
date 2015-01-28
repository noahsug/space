var Gameplay = di.service('Gameplay', ['GameplayParser', 'gameplayFile']);

Gameplay.prototype.init = function() {
  this.gameplayParser_.parse(this.gameplayFile_, this);
};

di.constant('gameplayFile', {
  player: [
    //'basic laser',
    //'burst laser',
    //'grenade',
    //'razors',
    //'sniper',
    //'missiles',
    'shotgun',

    //'stun',
    //'emp',
    'pistol',

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
      //'shotgun',
      'missiles',
      //'pistol',
      'circle',
    ],
    [
      'boss2',
      'sniper',
      'dash',
      'circle',
    ],
    [
      'boss3',
      'grenade',
      'teleport',
      'circle',
    ],
    [
      'boss4',
      'missiles',
      'stun',
      'circle',
    ],
    [
      'boss5',
      'grenade',
      'emp',
      'teleport',
      '+explosions',
      'circle',
    ],
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
      level: 1},
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
      level: 0},

    'stun': {
      desc: 'Shot that stuns the enemy on contact.',
      type:'secondary.stun', spec: {},
      level: 0},
    'emp': {
      desc: 'Grenade that disables enemy primary weapons.',
      type:'secondary.emp', spec: {},
      level: 1},
    'pistol': {
      desc: 'Basic laser.',
      type:'secondary.pistol', spec: {},
      level: 0},

    'dash': {
      desc: 'dash.',
      type: 'utility.dash', spec: {},
      level: 0},
    'teleport': {
      desc: 'Teleport behind the enemy.',
      type: 'utility.teleport', spec: {},
      level: 1},
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
    'mink': {
      desc: 'Small and agile, but deal less damage.',
      type: 'ability.mink', spec: {},
      level: 1},
    //'zombie': {
    //  desc: 'Stay alive for a few seconds after death.',
    //  type: 'ability.zombie', spec: {cooldown: 4},
    //  level: 9},

    '+health': {
      desc: '20% more health.',
      type: 'mod.health', spec: {health: 1.2},
      level: 0},
    '+speed': {
      desc: 'Move 20% faster.',
      type: 'mod.speed', spec: {speed: 1.3},
      level: 0},
    '+attack rate': {
      desc: 'Attack 20% faster.',
      type: 'mod.primaryCooldown', spec: {cooldown: 5 / 6},
      level: 1},
    '+explosions': {
      desc: '20% larger explosions.',
      type: 'mod.aoe', spec: {radius: 1.2},
      level: 0},
    //'+disable': {
    //  desc: 'Stuns, slows and disables last 20% longer.',
    //  type: 'mod.disable', spec: {duration: 1.2},
    //  level: 9},

    // Non-collectables.

    'circle': {
      desc: 'Circle',
      type: 'shape.circle', spec: {radius: 12}},

    'boss1': {
      type: 'stats', spec: {health: 5}},

    'boss2': {
      type: 'stats', spec: {health: 6}},

    'boss3': {
      type: 'stats', spec: {health: 7}},

    'boss4': {
      type: 'stats', spec: {health: 8}},

    'boss5': {
      type: 'stats', spec: {health: 10}}
  }
});
