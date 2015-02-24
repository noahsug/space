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
    //'charge',
    //'tracker',

    //'teleport',

    'knockback',
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
      'shotgun',
      //'missiles',
      //'pistol',
      //'split',
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
      id: 'primary.basicLaser',
      spec: {dmg: 4},
      level: 0},
    'basic laser II': {
      desc: 'Basic laser weapon.',
      id: 'primary.basicLaser',
      spec: {dmg: 5, power: 1},
      level: 1},
    'basic laser III': {
      desc: 'Basic laser weapon.',
      id: 'primary.basicLaser',
      spec: {dmg: 6, power: 2},
      level: 2},
    'burst laser': {
      desc: 'Fires a rapid volley of shots every 2 seconds.',
      id: 'primary.burstLaser',
      spec: {dmg: 4},
      level: 1},
    'burst laser II': {
      desc: 'Fires a rapid volley of shots every 2 seconds.',
      id: 'primary.burstLaser',
      spec: {dmg: 4, power: 1},
      level: 2},
    'shotgun': {
      desc: 'Fires a powerful burst of shots in an arc.',
      id:'primary.shotgun',
      spec: {dmg: 5, cooldown: 2, range: 100, projectiles: 6},
      level: 0},
    'shotgun II': {
      desc: 'Fires a powerful burst of shots in an arc.',
      id:'primary.shotgun',
      spec: {dmg: 5, cooldown: 2, range: 100, projectiles: 6, power: 1},
      level: 1},
    'shotgun III': {
      desc: 'Fires a powerful burst of shots in an arc.',
      id:'primary.shotgun',
      spec: {dmg: 5, cooldown: 2, range: 100, projectiles: 6, power: 2},
      level: 2},
    'grenade': {
      desc: 'Travels a short distance before exploding in a large area.',
      id:'primary.grenade',
      spec: {dmg: 10},
      level: 0},
    'razors': {
      desc: 'Fires three powerful shots in three directions.',
      id:'primary.razors',
      spec: {dmg: 8},
      level: 1},
    'sniper': {
      desc: 'Fires a fast, powerful shot.',
      id:'primary.sniper',
      spec: {dmg: 12},
      level: 1},
    'missiles': {
      desc: 'Fires seeking shots.',
      id:'primary.missiles',
      spec: {dmg: 6},
      level: 1},
    'missiles II': {
      desc: 'Fires seeking shots.',
      id:'primary.missiles',
      spec: {dmg: 6, power: 1},
      level: 2},

    'stun': {
      desc: 'Shot that stuns the enemy on contact.',
      id:'secondary.stun',
      spec: {dmg: 1},
      level: 0},
    'stun II': {
      desc: 'Shot that stuns the enemy on contact.',
      id:'secondary.stun',
      spec: {dmg: 1, power: 1},
      level: 1},
    'emp': {
      desc: 'Grenade that disables enemy primary weapons.',
      id:'secondary.emp',
      spec: {dmg: 1},
      level: 1},
    'emp II': {
      desc: 'Grenade that disables enemy primary weapons.',
      id:'secondary.emp',
      spec: {dmg: 1, power: 1},
      level: 2},
    'pistol': {
      desc: 'Basic laser.',
      id:'secondary.pistol',
      spec: {dmg: 3},
      level: 0},
    'pistol II': {
      desc: 'Basic laser.',
      id:'secondary.pistol',
      spec: {dmg: 3, power: 1},
      level: 1},
    'pistol III': {
      desc: 'Basic laser.',
      id:'secondary.pistol',
      spec: {dmg: 5, power: 2},
      level: 2},
    'charge': {
      desc: '',
      id:'secondary.charge', spec: {},
      level: 1},
    'tracker': {
      desc: '',
      id:'secondary.tracker', spec: {},
      level: 1},

    'ninja': {
      desc: '.',
      id: 'utility.ninja',
      spec: {},
      level: 0},
    'ninja II': {
      desc: '.',
      id: 'utility.ninja',
      spec: {power: 1},
      level: 0},
    'ninja III': {
      desc: '.',
      id: 'utility.ninja',
      spec: {power: 2},
      level: 0},
    'druid': {
      desc: '.',
      id: 'utility.druid',
      spec: {},
      level: 1},
    'druid II': {
      desc: '.',
      id: 'utility.druid',
      spec: {power: 1},
      level: 1},
    'druid III': {
      desc: '.',
      id: 'utility.druid',
      spec: {power: 2},
      level: 1},
    'tank': {
      desc: '.',
      id: 'utility.tank',
      spec: {def: 1.15},
      level: 0},
    'tank II': {
      desc: '.',
      id: 'utility.tank',
      spec: {def: 1.3},
      level: 0},
    'tank III': {
      desc: '.',
      id: 'utility.tank',
      spec: {power: 1, def: 1.4},
      level: 0},
    'ranger': {
      desc: '.',
      id: 'utility.ranger',
      spec: {range: 1.5},
      level: 0},
    'ranger II': {
      desc: '.',
      id: 'utility.ranger',
      spec: {power: 1, range: 3},
      level: 0},
    'ranger III': {
      desc: '.',
      id: 'utility.ranger',
      spec: {power: 2, range: 5},
      level: 0},

    'knockback': {
      desc: '',
      id:'ability.knockback', spec: {},
      level: 1},
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
    //'zombie': {
    //  desc: 'Stay alive for a few seconds after death.',
    //  id: 'ability.zombie', spec: {cooldown: 4},
    //  level: 9},

    // Non-collectables.

    'circle': {
      desc: 'Circle',
      id: 'shape.circle', spec: {radius: 12}}
  }
});
