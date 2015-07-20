var Gameplay = di.service('Gameplay', ['GameplayParser', 'gameplayFile']);

Gameplay.prototype.init = function() {
  this.gameplayParser_.parse(this.gameplayFile_, this);
};

g = {
  Speed: {
    SLOW: 170,
    DEFAULT: 240,
    FAST: 300,
    VERY_FAST: 400,

    SHIP_SPEED: 75,
    SHIP_ACCEL: 2,
    TURN_SPEED: Math.PI / 2,
    TURN_ACCEL: Math.PI / 2
  },

  Accuracy: {
    DEFAULT: _.radians(10),
    ACCURATE: _.radians(5),
    INACCURATE: _.radians(13)
  },

  Health: {
    DEFAULT: 100,
    PLAYER: 100
  },

  MaxTargetAngle: {
    DEFAULT: _.radians(30)
  },

  Lives: {
    DEFAULT: 1
  },

  Range: {
    TRAVEL_RATIO: 1.2  // How far bullets actually travel relative to range.
  }
};

di.constant('gameplayFile', {
  worlds: [
    {  // World 1
      events: [
        {  // 0
          text: 'tutorial',
          missions: [
            {
              unlocks: [1],
              stages: [
                ['a5'],
              ]
            }
          ]
        },
        {  // 1
          text: [
            'You\'ve done it. You\'ve finally killed him. ' +
              'The hive won\'t let you escape easily.',
            'Ships are quicking coming towards from you the East.'
          ],
          missions: [
            {
              text: 'fight',
              unlocks: [3],
              stages: [
                ['a2', 'a2'],
              ]
            },
            {
              text: 'flee',
              unlocks: [2]
            }
          ]
        },
        {  // 2
          text: [
            'The ships are hive darts, known for their speed. ' +
              'They catch up to you and open fire.',
            'You have no choice but to fight.'
          ],
          missions: [
            {
              text: 'fight',
              unlocks: [3],
              stages: [
                ['a2', 'a2'],
              ]
            }
          ]
        },
        {  // 3
          text: [
            'Three hive rams have caught up to you and are about to open ' +
              'fire. Far to your east a swarm of hive darts are moving to ' +
              'get behind you for a flank.',
          ],
          missions: [
            {
              text: 'charge the rams',
              unlocks: [4],
              stages: [
                ['a3', 'a3', 'a3'],
              ]
            },
            {
              text: 'fly east and engage the darts',
              unlocks: [5],
              stages: [
                ['a2'],
                ['a2', '-', 'a2'],
                ['a2', '-', 'a2', '-', 'a2'],
              ]
            }
          ]
        },
        {  // 4
          text: [
            'With the rams dispatched, the path ahead is clear. You fly at ' +
              'full speed away from the hive planet.',
            'A fleet of Hive Infestors comes up on your flank.',
          ],
          missions: [
            {
              text: 'fight',
              unlocks: [6],
              stages: [
                ['a2', 'a3'],
                ['a4', '-', 'a4'],
              ]
            }
          ]
        },
        {  // 5
          text: [
            'With the darts dispatched, the path east is clear. You fly at ' +
              'full speed away from the hive planet.',
            'A fleet of Hive Infestors spots you and comes up on your flank.',
          ],
          missions: [
            {
              text: 'fight',
              unlocks: [6],
              stages: [
                ['a2', 'a3'],
                ['a4', '-', 'a4'],
              ]
            }
          ]
        },
        {  // 6
          text: [
            '"You die here, scum." The Hive queen has arrived.',
          ],
          missions: [
            {
              text: 'fight',
              stages: [
                ['a2', 'a3', 'a2'],
                ['a3', 'a4', 'a4', 'a3'],
                ['a5'],
              ]
            }
          ]
        }
      ]
    }  // World 1
  ],

  stages: {
    'a1': {
      desc: 'Hive Scout',
      level: 0,
      hull: 'alien1',
      primary: ['alien laser']},
    'a2': {
      desc: 'Hive Dart',
      level: 1,
      hull: 'alien2',
      primary: ['alien laser'],
      secondary: ['knockback']},
    'a3': {
      desc: 'Hive Ram',
      level: 2,
      hull: 'alien3',
      primary: ['alien shotgun'],
      secondary: ['charge']},
    'a4': {
      desc: 'Hive Dart',
      level: 1,
      hull: 'alien2',
      primary: ['alien laser'],
      utility: ['dash']},
    'a5': {
      desc: 'Hive Infestor',
      level: 3,
      hull: 'alien4',
      primary: ['charge laser'],
      secondary: ['knockback']
    },
    'a6': {
      desc: 'Hive Queen',
      level: 4,
      hull: 'alien_boss',
      primary: ['alien gatling'],
      secondary: ['alien spawn'],
      ability: ['knockback']}
  },

  player: [
    //'shotgun',
    'charge laser',

    //'charge',
    'knockback',

    'temporal hole',

    //'basic laser',
    //'burst laser',
    //'grenade',
    //'razors',
    //'sniper',
    //'missiles',
    //'stinger',
    //'gatling',

    //'stun',
    //'emp',
    //'pistol',
    //'pull',
    //'tracker',
    //'turret',

    //'knockback',
    //'shield',
    //'reflect',
    //'tank',
    //'haze',

    //'teleport',
    //'refresh',
    //'divide',
    //'huge',
    //'stealth',
    //'sticky',

    'red',
    //'brown'
  ],

  inventory: [
    //'basic laser',
    //'burst laser',
    ////'grenade',
    ////'razors',
    //'sniper',
    //'missiles',
    ////'stinger',
    //'shotgun',
    ////'gatling',
    //
    //'stun',
    //'emp',
    //'pistol',
    ////'pull',
    //'charge',
    //'tracker',
    //'turret',
    //
    //'knockback',
    //'shield',
    //'reflect',
    ////'tank',
    ////'haze',
    //
    //'teleport',
    //'refresh',
    //'divide',
    ////'huge',
    ////'stealth',
    ////'sticky',
  ],

  items: {
    // Primary
    'shotgun': {
      desc: 'Tons of damage at close range, lowers movement.',
      id:'primary.shotgun',
      spec: {dmg: 4.5, cooldown: 4, range: 100, projectiles: 9},
      level: 0},
    'charge laser': {
      displayName: 'charge laser',
      desc: 'Gathers power, then fires 6 times.',
      id:'primary.chargeLaser',
      spec: {dmg: 7, cooldown: 4, projectiles: 6},
      level: 0},

    'alien laser': {
      desc: 'Standard laser.',
      id:'primary.sniper',
      spec: {dmg: 9, cooldown: 2, range: 400, style: 'alien'},
      level: 9},
    'alien shotgun': {
      displayName: 'shotgun',
      desc: 'Tons of damage at close range, passively lowers movement.',
      id:'primary.shotgun',
      spec: {dmg: 4.5, cooldown: 4, range: 100, projectiles: 9, style: 'alien'},
      level: 0},

    // Secondary
    'charge': {
      desc: 'Charge at the enemy, does damage if you collide.',
      id:'secondary.charge', spec: {dmg: 15, cooldown: 6},
      level: 0},
    'knockback': {
      desc: 'Knocks the enemy away.',
      id:'secondary.knockback', spec: {cooldown: 4},
      level: 0},

    // Ability
    'temporal hole': {
      desc: 'Temporarily vanish from existence, avoiding all harm.',
      id:'ability.poof', spec: {duration: 1, cooldown: 8},
      level: 0},

    // Utility
    'dash': {
      desc: 'Dash a short distance, passively increases movement.',
      id: 'utility.dash', spec: {cooldown: 1.75},
      level: 0},

    // --
    // Unused
    // --

    // Primary
    'basic laser': {
      desc: 'Stand laser weapon.',
      id: 'primary.basicLaser',
      spec: {dmg: 5, cooldown: .8, range: 200},
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
      spec: {dmg: 4, cooldown: 2.2, range: 150, projectiles: 5},
      level: 1},
    'alien burst': {
      desc: 'Rapid volley of shots.',
      id: 'primary.burstLaser',
      spec: {dmg: 5, cooldown: 2.2, range: 150, projectiles: 3, style: 'alien'},
      level: 9},
    'alien doubleshot': {
      desc: 'Long range, fires twice.',
      id: 'primary.burstLaser',
      spec: {dmg: 5, cooldown: 2.75, range: 400,
             projectiles: 2, style: 'alien'},
      level: 3},
    //'burst laser II': {
    //  desc: 'Rapid volley of shots.',
    //  id: 'primary.burstLaser',
    //  spec: {dmg: 4, cooldown: 2.5, range: 150, projectiles: 7},
    //  level: 2},
    //'shotgun II': {
    //  desc: 'Burst of shots in an arc.',
    //  id:'primary.shotgun',
    //  spec: {dmg: 5, cooldown: 1.75, range: 100, projectiles: 8, power: 1},
    //  level: 2},
    'scatter shot': {
      desc: 'Big burst of weak shots.',
      id:'primary.shotgun',
      spec: {dmg: 4, cooldown: 2.1, range: 150, projectiles: 10, power: 2},
      level: 2},
    'grenade': {
      desc: 'Explodes in a large area.',
      id:'primary.grenade',
      spec: {dmg: 10, range: 150, cooldown: 2},
      level: 0},
    'alien grenade': {
      desc: 'Explodes in a large area.',
      id:'primary.grenade',
      spec: {dmg: 10, range: 150, cooldown: 2, style: 'alien'},
      level: 9},
    'razors': {
      desc: 'Powerful shots in three directions.',
      id:'primary.razors',
      spec: {dmg: 9, projectiles: 3, cooldown: 2, range: 150},
      level: 1},
    'alien blades': {
      desc: 'Fires two spinning blade.',
      id:'primary.razors',
      spec: {dmg: 4, projectiles: 2, cooldown: .8, range: 150,
             spread: _.radians(15), style: 'alien'},
      level: 3},
    //'razors II': {
    //  desc: 'Powerful shots in five directions.',
    //  id:'primary.razors',
    //  spec: {power: 1, dmg: 10, projectiles: 5, cooldown: 2.25, range: 150},
    //  level: 4},
    'sniper': {
      desc: 'Long range, low rate of rate.',
      id:'primary.sniper',
      spec: {dmg: 12, cooldown: 3, range: 500},
      level: 3},
    'missiles': {
      desc: 'Long range heat seeking missiles.',
      id:'primary.missiles',
      spec: {dmg: 6, seek: _.radians(60), cooldown: 1.6, range: 350},
      level: 5},
    'stinger': {
      desc: 'Rapidly firing heat seeking missiles.',
      id:'primary.missiles',
      spec: {dmg: 2, seek: _.radians(60), cooldown: .5, range: 200, power: 1},
      level: 1},
    'alien stinger': {
      desc: 'Rapidly firing heat seeking missiles.',
      id:'primary.missiles',
      spec: {dmg: 4, seek: _.radians(60), cooldown: 1, range: 150, power: 1,
             style: 'alien'},
      level: 9},
    'gatling': {
      desc: 'Fires faster and faster over time.',
      id:'primary.gatling',
      spec: {dmg: 3, cooldown: 1, range: 200},
      level: 4},
    'alien gatling': {
      desc: 'Fires faster and faster over time.',
      id:'primary.gatling',
      spec: {dmg: 3, cooldown: 1.3, range: 400, style: 'alien'},
      level: 9},

    // Secondary
    'turret': {
      desc: 'Drops turrets that shoot at the enemy.',
      id:'secondary.turret',
      spec: {cooldown: 5, range: 10000},
      level: 5},
    'alien spawn': {
      desc: 'Spawns a small alien every 5s.',
      id:'secondary.spawn',
      spec: {cooldown: 5, range: 10000, style: 'alien'},
      level: 5},
    'stun': {
      desc: 'Stun enemy for 1s.',
      id:'secondary.stun',
      spec: {dmg: 1, cooldown: 4, range: 300},
      level: 4},
    'alien stun': {
      desc: 'Stun enemy for 1s.',
      id:'secondary.stun',
      spec: {dmg: 1, cooldown: 1.25, range: 300, style: 'alien'},
      level: 9},
    //'stun II': {
    //  desc: 'Stun enemy for 1.4s.',
    //  id:'secondary.stun',
    //  spec: {dmg: 1, cooldown: 1.25, range: 300},
    //  level: 3},
    'emp': {
      desc: 'Grenade that disables weapons for 1.5s.',
      id:'secondary.emp',
      spec: {dmg: 1, cooldown: 1.5, range: 150},
      level: 3},
    'alien emp': {
      desc: 'Grenade that disables weapons for 1s.',
      id:'secondary.emp',
      spec: {dmg: 1, cooldown: 1, range: 150, style: 'alien'},
      level: 3},
    //'emp II': {
    //  desc: 'Grenade that disables weapons for 1.5s.',
    //  id:'secondary.emp',
    //  spec: {dmg: 1, cooldown: 1.5, range: 150, power: 1},
    //  level: 5},
    'pistol': {
      desc: 'Standard weak laser weapon.',
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
    //'charge II': {
    //  desc: 'Charge the enemy while tasking less damage',
    //  id:'secondary.charge', spec: {power: 1},
    //  level: 1},
    'tracker': {
      desc: 'Tracks enemy, ensuring next attack will hit and deal +50% damage.',
      id:'secondary.tracker', spec: {cooldown: 3, dmgRatio: 1.5},
      level: 1},
    'pull': {
      desc: 'Pulls enemy close and stuns. Range: 10. Stun duration: 1.5s',
      id:'secondary.pull', spec: {duration: 1.5, range: 100, cooldown: 4},
      level: 2},
    //'melee': {
    //  desc: 'Primary 2x for 75% damage while close.',
    //  id:'secondary.melee', spec: {dmgRatio: .75, range: 50},
    //  level: 1},

    // Utility
    'refresh': {
      desc: 'Reduces all cooldowns by 4s.',
      id: 'utility.refresh', spec: {cooldown: 10},
      level: 0},
    'teleport': {
      desc: 'Ability to teleport behind the enemy',
      id: 'utility.teleport', spec: {cooldown: 6},
      level: 1},
    'stealth': {
      desc: 'Turn invisible, then deal 2x damage.',
      id: 'utility.invisible', spec: {power: 3},
      level: 1},
    'tiny': {
      desc: 'Smaller and faster.',
      id: 'utility.druid', spec: {power: 1},
      level: 0},
    'huge': {
      desc: 'Larger and more powerful.',
      id: 'utility.druid', spec: {power: 2},
      level: 3},
    'divide': {
      desc: 'Divide into two weaker halfs.',
      id: 'utility.druid', spec: {power: 3},
      level: 5},
    //'scope': {
    //  desc: '1.5x range.',
    //  id: 'utility.ranger', spec: {power: 1, range: 1.5},
    //  level: 1},
    'scope': {
      desc: '1.5x range, better accuracy.',
      id: 'utility.ranger', spec: {range: 1.5, accuracy: 0},
      level: 4},
    'heated': {
      desc: 'Shots seek target, but have less range.',
      id: 'utility.ranger', spec: {range: .75, seek: _.radians(50)},
      level: 2},
    'sticky': {
      desc: 'Shots slow target by 75% with each hit, can stack up to 5 times.',
      id: 'utility.sticky',
      spec: {},
      level: 3},

    // Ability
    'alien knockback': {
      desc: 'Knocks the enemy away.',
      id:'ability.knockback', spec: {cooldown: 8},
      level: 9},
    'haze': {
      desc: 'Lowers enemy accuracy for a short time.',
      id: 'ability.haze', spec: {cooldown: 6},
      level: 0},
    'shield': {
      desc: 'Blocks the next shot.',
      id: 'ability.shield', spec: {cooldown: 8},
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
      desc: 'Reflects any projectile for short time.',
      id: 'ability.reflect', spec: {duration: 1.5, cooldown: 8},
      level: 2},
    //'reflect II': {
    //  desc: 'Reflects shots for 2s',
    //  id: 'ability.reflect', spec: {power: 1},
    //  level: 3},
    //'rock': {
    //  desc: '15% less damage.',
    //  id: 'ability.tank', spec: {power: 1, def: 1.15},
    //  level: 1},
    'tank': {
      desc: '20% less damage.',
      id: 'ability.tank', spec: {power: 1, def: 1.2},
      level: 4},
    'diamond': {
      desc: '10% more health & no collision damage.',
      id: 'ability.tank', spec: {power: 3, health: 1.1},
      level: 5},
    //'zombie': {
    //  desc: 'Stay alive for a few seconds after death.',
    //  id: 'ability.zombie', spec: {cooldown: 4},
    //  level: 9},

    // Unused
    'medic': {
      desc: 'Slowly heal over time',
      id: 'augment.medic', spec: {},
      level: 1},
    'extreme': {
      desc: 'Double damage, half health',
      id: 'augment.extreme', spec: {},
      level: 1},
    'freeze': {
      desc: 'Tap to freeze enemy [1 use / battle]',
      id: 'augment.freezeClick', spec: {},
      level: 0},
    'tap teleport': {
      displayName: 'teleport',
      desc: 'Tap to teleport [1 use / battle]',
      id: 'augment.teleClick', spec: {},
      level: 1},
    'multi': {
      desc: '+2 projectiles for shotguns & burst',
      id: 'augment.multi', spec: {projectiles: 2},
      req: ['burst laser', 'shotgun', 'scatter shot', 'razors'],
      level: 2},
    'fast': {
      desc: '+15% speed',
      id: 'augment.heavy', spec: {speedRatio: 1.5},
      level: 0},
    'speedy': {
      desc: '+30% speed',
      id: 'augment.heavy', spec: {speedRatio: 1.5},
      level: 4},
    'beefy': {
      desc: '+20% health, -50% speed',
      id: 'augment.heavy', spec: {healthRatio: 1.2, speedRatio: .5},
      level: 3},
    'sharp': {
      desc: 'Collisions do 2x damage to target',
      id: 'augment.sharp', spec: {dmgRatio: 2},
      level: 4},
    'camo': {
      desc: 'Can fire weapons while stealthed',
      id: 'augment.camo', spec: {}, req: ['stealth'],
      level: 5},
    'archery': {
      desc: 'Shoot twice while long range',
      id: 'augment.archery', spec: {}, req: ['sniper', 'missiles'],
      level: 3},

    // Hulls
    'alien1': {
      id: 'hull.basic',
      spec: {sprite: 'alien1'}},
    'alien2': {
      id: 'hull.basic',
      spec: {sprite: 'alien2'}},
    'alien3': {
      id: 'hull.basic',
      spec: {sprite: 'alien3'}},
    'alien4': {
      id: 'hull.basic',
      spec: {sprite: 'alien4'}},
    'alien_boss': {
      id: 'hull.basic',
      spec: {sprite: 'alien_boss'}},
    'red': {
      id: 'hull.basic',
      spec: {sprite: 'red'}},
    'mech1': {
      id: 'hull.basic',
      spec: {sprite: 'mech1'}},
    'station': {
      id: 'hull.basic',
      spec: {sprite: 'station'}},
    'mech_boss': {
      id: 'hull.basic',
      spec: {sprite: 'mech_boss'}},
    'brown': {
      id: 'hull.basic',
      spec: {sprite: 'brown'}}
  }
});
