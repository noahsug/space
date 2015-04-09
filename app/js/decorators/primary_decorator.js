var PrimaryDecorator = di.service('PrimaryDecorator', [
  'EntityDecorator', 'DecoratorUtil as util']);

PrimaryDecorator.prototype.init = function() {
  this.d_ = this.entityDecorator_.getDecorators();
  this.entityDecorator_.addDecoratorObj(this, 'primary');
};

PrimaryDecorator.prototype.decorateGrenade_ = function(obj, spec) {
  this.util_.spec(obj, 'primary', spec, {
    speed: Speed.SLOW,
    radius: 20
  });

  this.util_.addDmgWeapon_(obj, obj.primary,
                          this.util_.fireBomb.bind(this.util_));
};

PrimaryDecorator.prototype.decorateBasicLaser_ = function(obj, spec) {
  this.util_.spec(obj, 'primary', spec, {
    length: 8 + 16
  });

  this.util_.addDmgWeapon_(obj, obj.primary,
                          this.util_.fireLaser.bind(this.util_));
};

PrimaryDecorator.prototype.decorateShotgun_ = function(obj, spec) {
  this.util_.spec(obj, 'primary', spec, {
    length: 4 + 16,
    spread: _.radians(35),
    speed: Speed.VERY_FAST,
    style: 'weak'
  });

  switch(spec.power) {
  case 2:
    obj.primary.spread *= 1.2;
  case 1:
    obj.primary.spread *= 1.2;
  }

  this.util_.addDmgWeapon_(obj, obj.primary,
                          this.util_.fireLaser.bind(this.util_));
};

PrimaryDecorator.prototype.decorateRazors_ = function(obj, spec)  {
  this.util_.spec(obj, 'primary', spec, {
    radius: 6,
    spread: _.radians(40),
    speed: Speed.FAST
  });

  switch(spec.power) {
  case 1:
    obj.primary.spread *= 1.4;
  }

  this.util_.addDmgWeapon_(obj, obj.primary,
                          this.util_.fireBlade.bind(this.util_));
};

PrimaryDecorator.prototype.decorateMissiles_ = function(obj, spec) {
  this.util_.spec(obj, 'primary', spec, {
    radius: 6,
    seek: _.radians(50),
    speed: Speed.DEFAULT
  });

  switch(spec.power) {
  case 1:
    obj.primary.speed *= 1.1;
  }

  this.util_.addDmgWeapon_(obj, obj.primary,
                          this.util_.fireBlade.bind(this.util_));
};

PrimaryDecorator.prototype.decorateSniper_ = function(obj, spec) {
  this.util_.spec(obj, 'primary', spec, {
    length: 20 + 16,
    speed: Speed.VERY_FAST,
    accuracy: Accuracy.ACCURATE
  });

  this.util_.addDmgWeapon_(obj, obj.primary,
                          this.util_.fireLaser.bind(this.util_));
};

PrimaryDecorator.prototype.decorateBurstLaser_ = function(obj, spec)  {
  this.util_.spec(obj, 'primary', spec, {
    miniCooldown: .12,
    length: 8 + 16,
    speed: Speed.DEFAULT,
    style: 'weak'
  });

  var projectilesRemaining = 0;
  this.util_.addWeapon(obj, obj.primary, function() {
    projectilesRemaining = obj.primary.projectiles;
  });

  this.util_.addCooldown(obj, function() {
    if (obj.effect.silenced) projectilesRemaining = 0;
    if (projectilesRemaining) {
      var laser = this.util_.fireLaser(obj, obj.primary);
      _.decorate(laser, this.d_.dmgCollision, obj.primary);
      projectilesRemaining--;
    }
    return projectilesRemaining && obj.primary.miniCooldown;
  }.bind(this));
};
