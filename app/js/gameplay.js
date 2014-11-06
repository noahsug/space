di.constant('gameplay', {
  init: {
    player: {
      'weapon.laser': {},
      'movement.radial': {speed: 135},
      'health': {health: 25},
      'shape.circle': {radius: 10}
    },
    enemy: {
      'weapon.shotgun': {},
      'movement.radial': {speed: 100},
      'health': {health: 20},
      'shape.circle': {radius: 10},
      'power.teleport': {cooldown: 2}
    },

    items: {
      'weapon.shotgun': {}
    }
  }
});
