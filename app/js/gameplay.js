var Gameplay = di.service('Gameplay', ['GameplayParser', 'gameplayFile']);

Gameplay.prototype.init = function() {
  this.gameplayParser_.parse(this.gameplayFile_, this);
};

Speed = {
  SLOW: 150,
  DEFAULT: 200,
  FAST: 300,
  VERY_FAST: 400,

  SHIP_SPEED: 100
};

Accuracy = {
  DEFAULT: _.radians(10),
  ACCURATE: _.radians(5),
  INACCURATE: _.radians(15)
};

Health = {
  DEFAULT: 50,
  PLAYER_HEALTH: 65
};

Gameplay.prototype.worlds = [
  {  // 0
    rows: 1,
    cols: 3
  },
  {  // 1
    rows: 1,
    cols: 4
  },
  {  // 2
    rows: 2,
    cols: 3
  },
  {  // 3
    rows: 3,
    cols: 3
  },
  {  // 4
    rows: 2,
    cols: 5
  },
  //{  // 5
  //  rows: 2,
  //  cols: 5
  //},
  //{  // 6
  //  rows: 3,
  //  cols: 3
  //},
  //{  // 7
  //  rows: 3,
  //  cols: 4
  //},
  //{  // 8
  //  rows: 3,
  //  cols: 5
  //},
  //{  // 9
  //  rows: 6,
  //  cols: 3
  //},
  //{  // 10
  //  rows: 8,
  //  cols: 3
  //},
  //{  // 11
  //  rows: 8,
  //  cols: 5
  //}
];

di.constant('gameplayFile', {
  player: [
    'basic laser',
    //'burst laser',
    //'grenade',
    //'razors',
    //'sniper',
    //'missiles',
    //'shotgun',
    //'gatling',

    //'stun',
    //'emp',
    //'pistol',
    //'charge',
    //'tracker',
    'turret',

    //'teleport',

    //'knockback',
    //'shield',
    //'reflect',
    //'haze',

    //'ninja',
    //'divide',

    //'freeze',
    //'warp',
  ],

  inventory: [
    'shotgun',
    'pistol',
    'stealth',
  ],

  bosses: [
    //[
    //  'shotgun',
    //  //'missiles',
    //  //'pistol',
    //  //'split',
    //],
    //[
    //  'razors',
    //  'turtle',
    //  '+defence',
    //],
    //[
    //  'grenade',
    //  'emp',
    //  'baboon II',
    //  '+explosions',
    //],
    //[
    //  'sniper',
    //  'pistol II',
    //  'mink',
    //  'dash II',
    //  '+speed II',
    //],
    //[
    //  'missiles II',
    //  'teleport',
    //  '+attack rate II',
    //  'baboon III',
    //  'stun',
    //],
  ],

  items: {
    'basic laser': {
      desc: 'Basic laser.',
      id: 'primary.basicLaser',
      spec: {dmg: 4, cooldown: .75, range: 150},
      level: 0},
    //'basic laser II': {
    //  desc: 'Powerful Basic laser.',
    //  id: 'primary.basicLaser',
    //  spec: {dmg: 6, cooldown: .75, range: 150},
    //  level: 2},
    //'basic laser III': {
    //  desc: 'Rapid, powerful Basic laser.',
    //  id: 'primary.basicLaser',
    //  spec: {dmg: 5, cooldown: .5, range: 150},
    //  level: 4},
    'burst laser': {
      desc: 'Rapid volley of shots.',
      id: 'primary.burstLaser',
      spec: {dmg: 4, cooldown: 2, range: 150, projectiles: 5},
      level: 1},
    //'burst laser II': {
    //  desc: 'Rapid volley of shots.',
    //  id: 'primary.burstLaser',
    //  spec: {dmg: 4, cooldown: 2.5, range: 150, projectiles: 7},
    //  level: 2},
    'shotgun': {
      desc: 'Burst of shots in an arc.',
      id:'primary.shotgun',
      spec: {dmg: 5, cooldown: 2.1, range: 100, projectiles: 6},
      level: 0},
    //'shotgun II': {
    //  desc: 'Burst of shots in an arc.',
    //  id:'primary.shotgun',
    //  spec: {dmg: 5, cooldown: 1.75, range: 100, projectiles: 8, power: 1},
    //  level: 2},
    'scatter shot': {
      desc: 'Big burst of weak shots.',
      id:'primary.shotgun',
      spec: {dmg: 3, cooldown: 2.1, range: 150, projectiles: 10, power: 2},
      level: 5},
    'grenade': {
      desc: 'Explodes in a large area.',
      id:'primary.grenade',
      spec: {dmg: 10, range: 150, cooldown: 2},
      level: 0},
    'razors': {
      desc: 'Powerful shots in three directions.',
      id:'primary.razors',
      spec: {dmg: 10, projectiles: 3, cooldown: 2, range: 150},
      level: 1},
    //'razors II': {
    //  desc: 'Powerful shots in five directions.',
    //  id:'primary.razors',
    //  spec: {power: 1, dmg: 10, projectiles: 5, cooldown: 2.25, range: 150},
    //  level: 4},
    'sniper': {
      desc: 'Long range, low rate of rate.',
      id:'primary.sniper',
      spec: {dmg: 12, cooldown: 4, range: 500},
      level: 3},
    'missiles': {
      desc: 'Heat seeking missiles.',
      id:'primary.missiles',
      spec: {dmg: 7, seek: _.radians(60), cooldown: 1.6, range: 300},
      level: 1},
    'stinger': {
      desc: 'Rapid heat seeking missiles.',
      id:'primary.missiles',
      spec: {dmg: 3, seek: _.radians(60), cooldown: .75, range: 200, power: 1},
      level: 5},
    'gatling': {
      desc: 'Slowly inceases firing speed.',
      id:'primary.gatling',
      spec: {dmg: 1, cooldown: 1, range: 150},
      level: 5},

    'turret': {
      desc: 'Drops turrets that shoot at the enemy.',
      id:'secondary.turret',
      spec: {cooldown: 6, range: 10000},
      level: 2},
    'stun': {
      desc: 'Stun enemy for 1s.',
      id:'secondary.stun',
      spec: {dmg: 1, cooldown: 1.25, range: 300},
      level: 2},
    //'stun II': {
    //  desc: 'Stun enemy for 1.4s.',
    //  id:'secondary.stun',
    //  spec: {dmg: 1, cooldown: 1.25, range: 300},
    //  level: 3},
    'emp': {
      desc: 'Grenade that disables weapons for 1.2s.',
      id:'secondary.emp',
      spec: {dmg: 1, cooldown: 1.5, range: 150},
      level: 2},
    //'emp II': {
    //  desc: 'Grenade that disables weapons for 1.5s.',
    //  id:'secondary.emp',
    //  spec: {dmg: 1, cooldown: 1.5, range: 150, power: 1},
    //  level: 5},
    'pistol': {
      desc: 'Basic laser.',
      id:'secondary.pistol',
      spec: {dmg: 3, cooldown: 1.5, range: 300},
      level: 0},
    //'pistol II': {
    //  desc: 'Powerful basic laser.',
    //  id:'secondary.pistol',
    //  spec: {dmg: 5, cooldown: 1.25, range: 300},
    //  level: 3},
    //'pistol III': {
    //  desc: 'Rapid, powerful basic laser.',
    //  id:'secondary.pistol',
    //  spec: {dmg: 5, cooldown: 1, range: 300},
    //  level: 4},
    'charge': {
      desc: 'Charge the enemy.',
      id:'secondary.charge', spec: {},
      level: 0},
    //'charge II': {
    //  desc: 'Charge the enemy while tasking less damage',
    //  id:'secondary.charge', spec: {power: 1},
    //  level: 1},
    //'tracker': {
    //  desc: 'Tracks enemy, ensuring next attack will hit and deal +25% damage.',
    //  id:'secondary.tracker', spec: {},
    //  level: 0},
    'tracker': {
      desc: 'Tracks enemy, ensuring next attack will hit and deal +50% damage.',
      id:'secondary.tracker', spec: {power: 1},
      level: 1},
    'pull': {
      desc: 'Pulls enemy close and stuns. Range: 10. Stun duration: .75s',
      id:'secondary.pull', spec: {duration: .75, range: 100},
      level: 1},
    //'melee': {
    //  desc: 'Primary 2x for 75% damage while close.',
    //  id:'secondary.melee', spec: {dmgRatio: .75, range: 50},
    //  level: 1},

    'dash': {
      desc: 'Ability to dash a short distance.',
      id: 'utility.ninja', spec: {power: 1},
      level: 2},
    'teleport': {
      desc: 'Ability to teleport behind the enemy.',
      id: 'utility.ninja', spec: {power: 2},
      level: 3},
    'stealth': {
      desc: 'Ability to turn invisible for a short period of time.',
      id: 'utility.ninja', spec: {power: 3},
      level: 0},
    'tiny': {
      desc: 'Smaller and faster.',
      id: 'utility.druid', spec: {power: 1},
      level: 0},
    'huge': {
      desc: 'Larger and more powerful.',
      id: 'utility.druid', spec: {power: 2},
      level: 3},
    'divide': {
      desc: 'Divide into two slightly weaker halfs.',
      id: 'utility.druid', spec: {power: 3},
      level: 5},
    //'scope': {
    //  desc: '1.5x range.',
    //  id: 'utility.ranger', spec: {power: 1, range: 1.5},
    //  level: 1},
    'scope': {
      desc: '2x range, better accuracy.',
      id: 'utility.ranger', spec: {power: 2, range: 2},
      level: 4},
    'heated': {
      desc: 'Shots seek target, but have less range.',
      id: 'utility.ranger', spec: {power: 3},
      level: 2},
    //'sticky': {
    //  desc: 'Shots slow target with each hit.',
    //  id: 'utility.sticky',
    //  spec: {},
    //  level: 3},

    'knockback': {
      desc: 'Knocks the enemy away.',
      id:'ability.knockback', spec: {},
      level: 0},
    'haze': {
      desc: 'Lowers enemy accuracy for a short time.',
      id: 'ability.haze', spec: {},
      level: 1},
    'shield': {
      desc: 'Blocks the next shot.',
      id: 'ability.shield', spec: {},
      level: 3},
    //'shield II': {
    //  desc: 'Blocks the next two shots.',
    //  id: 'ability.shield', spec: {power: 1},
    //  level: 4},
    //'shield III': {
    //  desc: 'Blocks the next three shots.',
    //  id: 'ability.shield', spec: {power: 2},
    //  level: 5},
    'reflect': {
      desc: 'Reflects shots for 1.5s.',
      id: 'ability.reflect', spec: {},
      level: 2},
    //'reflect II': {
    //  desc: 'Reflects shots for 2s',
    //  id: 'ability.reflect', spec: {power: 1},
    //  level: 3},
    //'rock': {
    //  desc: '15% less damage.',
    //  id: 'ability.tank', spec: {power: 1, def: 1.15},
    //  level: 1},
    //'steel': {
    //  desc: '30% less damage.',
    //  id: 'ability.tank', spec: {power: 2, def: 1.3},
    //  level: 4},
    'diamond': {
      desc: '10% more health & no collision damage.',
      id: 'ability.tank', spec: {power: 3, health: 1.1},
      level: 5},
    //'zombie': {
    //  desc: 'Stay alive for a few seconds after death.',
    //  id: 'ability.zombie', spec: {cooldown: 4},
    //  level: 9},

    'medic': {
      desc: 'Slowly heal over time',
      id: 'augment.medic', spec: {},
      level: 0},
    'extreme': {
      desc: 'Double damage, half health',
      id: 'augment.extreme', spec: {},
      level: 0},
    'freeze': {
      desc: 'Tap to freeze enemy [1 use / battle]',
      id: 'augment.freezeClick', spec: {},
      level: 0},
    'warp': {
      desc: 'Tap to teleport [1 use / battle]',
      id: 'augment.teleClick', spec: {},
      level: 0},
    'multi': {
      desc: '+2 projectiles for shotguns & burst',
      id: 'augment.multi', spec: {projectiles: 2},
      req: ['burst laser', 'shotgun', 'scatter shot', 'razors'],
      level: 0},
    'speedy': {
      desc: '+50% speed',
      id: 'augment.heavy', spec: {speedRatio: 1.5},
      level: 0},
    'heavy': {
      desc: '+20% health, -50% speed',
      id: 'augment.heavy', spec: {healthRatio: 1.2, speedRatio: .5},
      level: 0},
    'sharp': {
      desc: '2x damage on collisions',
      id: 'augment.sharp', spec: {dmgRatio: 2},
      level: 0},
    'camo': {
      desc: 'Can fire weapons while stealthed',
      id: 'augment.camo', spec: {}, req: ['stealth'],
      level: 0}
  }
});
