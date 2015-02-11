var PrimaryDecorators = di.service('PrimaryDecorators', [
  'EntityDecorator', 'DecoratorUtil as util']);

PrimaryDecorators.prototype.init = function() {
  this.d_ = this.entityDecorator_.getDecorators();
  this.entityDecorator_.addDecoratorObj(this, 'primary');
};

PrimaryDecorators.prototype.decorateGrenade_ = function(obj, spec) {
  _.spec(obj, 'primary', spec, {
    dmg: 10,
    speed: 200,
    radius: 20,
    accuracy: _.radians(10),
    cooldown: 2,
    range: 150
  });

  this.addDmgWeapon_(obj, this.util_.fireBomb.bind(this.util_));
};

PrimaryDecorators.prototype.decorateBasicLaser_ = function(obj, spec) {
  _.spec(obj, 'primary', spec, {
    dmg: 4,
    speed: 300,
    accuracy: _.radians(10),
    cooldown: .75,
    length: 8 + 16,
    range: 200
  });

  switch(spec.power) {
  case 2:
    obj.primary.cooldown *= .75;
  case 1:
    obj.primary.dmg *= 1.5;
  }

  this.addDmgWeapon_(obj, this.util_.fireLaser.bind(this.util_));
};

PrimaryDecorators.prototype.decorateShotgun_ = function(obj, spec) {
  _.spec(obj, 'primary', spec, {
    dmg: 5,
    speed: 550,
    accuracy: _.radians(10),
    cooldown: 2,
    spread: _.radians(35),
    projectiles: 6,
    length: 4 + 16,
    style: 'bullet',
    range: 100
  });

  switch(spec.power) {
  case 2:
    obj.primary.projectiles += 2;
    obj.primary.spread *= 1.2;
    obj.primary.cooldown *= .9;
  case 1:
    obj.primary.projectiles += 2;
    obj.primary.spread *= 1.2;
    obj.primary.cooldown *= .9;
  }

  this.addDmgWeapon_(obj, this.util_.fireLaser.bind(this.util_));
};

PrimaryDecorators.prototype.decorateRazors_ = function(obj, spec)  {
  _.spec(obj, 'primary', spec, {
    dmg: 8,
    speed: 350,
    radius: 6,
    spread: _.radians(40),
    projectiles: 3,
    accuracy: _.radians(10),
    cooldown: 2,
    range: 150
  });

  this.addDmgWeapon_(obj, this.util_.fireBlade.bind(this.util_));
};

PrimaryDecorators.prototype.decorateMissiles_ = function(obj, spec) {
  _.spec(obj, 'primary', spec, {
    dmg: 6,
    speed: 300,
    seek: _.radians(60),
    radius: 6,
    accuracy: _.radians(10),
    cooldown: 1.6,
    range: 300
  });

  switch(spec.power) {
  case 1:
    obj.primary.cooldown *= .8;
    obj.primary.speed *= 1.1;
  }

  this.addDmgWeapon_(obj, this.util_.fireBlade.bind(this.util_));
};

PrimaryDecorators.prototype.decorateSniper_ = function(obj, spec) {
  _.spec(obj, 'primary', spec, {
    dmg: 12,
    speed: 350,
    length: 20 + 16,
    accuracy: _.radians(5),
    cooldown: 2,
    range: 500
  });

  this.addDmgWeapon_(obj, this.util_.fireLaser.bind(this.util_));
};

PrimaryDecorators.prototype.decorateBurstLaser_ = function(obj, spec)  {
  _.spec(obj, 'primary', spec, {
    dmg: 4,
    speed: 200,
    accuracy: _.radians(25),
    cooldown: 2,
    projectiles: 5,
    miniCooldown: .12,
    length: 8 + 16,
    range: 150
  });

  switch(spec.power) {
  case 1:
    obj.primary.projectiles += 2;
  }

  var projectilesRemaining = 0;
  this.util_.addWeapon(obj, obj.primary, function() {
    projectilesRemaining = obj.primary.projectiles;
  });

  this.util_.onCooldown(obj, function() {
    if (obj.effect.silenced) projectilesRemaining = 0;
    if (projectilesRemaining) {
      var laser = this.util_.fireLaser(obj, obj.primary);
      _.decorate(laser, this.d_.dmgCollision, obj.primary);
      projectilesRemaining--;
    }
    return projectilesRemaining && obj.primary.miniCooldown;
  }.bind(this));
};

PrimaryDecorators.prototype.addDmgWeapon_ = function(obj, fire) {
  this.util_.addWeapon(obj, obj.primary, function() {
    var projectile = fire(obj, obj.primary);
    _.decorate(projectile, this.d_.dmgCollision, obj.primary);
  }.bind(this));
};
