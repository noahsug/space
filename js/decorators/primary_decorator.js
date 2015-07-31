var PrimaryDecorator = di.service('PrimaryDecorator', [
  'EntityDecorator', 'DecoratorUtil as util', 'GameModel as gm',
  'ItemService', 'Random']);

PrimaryDecorator.prototype.init = function() {
  this.d_ = this.entityDecorator_.getDecorators();
  this.entityDecorator_.addDecoratorObj(this, 'primary');
};

PrimaryDecorator.prototype.decorateGrenade_ = function(obj, spec) {
  this.util_.spec(obj, 'primary', spec, {
    speed: g.Speed.SLOW,
    radius: 20,
    maxTargetAngle: g.MaxTargetAngle.DEFAULT,
    firesDodgableProj: true
  });

  this.util_.addBasicWeapon_(obj, obj.primary, this.util_.proj.bomb);
};

PrimaryDecorator.prototype.decorateBasicLaser_ = function(obj, spec) {
  this.util_.spec(obj, 'primary', spec, {
    length: 8 + 16,
    maxTargetAngle: g.MaxTargetAngle.DEFAULT,
    firesDodgableProj: true
  });

  this.util_.addBasicWeapon_(obj, obj.primary, this.util_.proj.laser);
};

PrimaryDecorator.prototype.decorateShotgun_ = function(obj, spec) {
  spec = this.util_.spec(obj, 'primary', spec, {
    length: 8 + 16,
    spread: _.radians(35),
    speed: g.Speed.VERY_FAST,
    style: 'weak',
    maxTargetAngle: g.MaxTargetAngle.DEFAULT
  });

  this.util_.mod(obj, 'movement.speed', .75);

  this.util_.addBasicWeapon_(obj, spec, this.util_.proj.laser);
};

PrimaryDecorator.prototype.decorateRazors_ = function(obj, spec)  {
  this.util_.spec(obj, 'primary', spec, {
    radius: 6,
    spread: _.radians(40),
    speed: g.Speed.FAST,
    maxTargetAngle: g.MaxTargetAngle.DEFAULT,
    firesDodgableProj: true
  });

  this.util_.addBasicWeapon_(obj, obj.primary, this.util_.proj.blade);
};

PrimaryDecorator.prototype.decorateMissiles_ = function(obj, spec) {
  this.util_.spec(obj, 'primary', spec, {
    radius: 6,
    seek: _.radians(50),
    speed: g.Speed.DEFAULT,
    maxTargetAngle: g.MaxTargetAngle.DEFAULT,
    firesDodgableProj: true
  });

  this.util_.addBasicWeapon_(obj, obj.primary, this.util_.proj.blade);
};

PrimaryDecorator.prototype.decorateSniper_ = function(obj, spec) {
  this.util_.spec(obj, 'primary', spec, {
    length: 20 + 16,
    speed: g.Speed.VERY_FAST,
    accuracy: g.Accuracy.ACCURATE,
    maxTargetAngle: g.MaxTargetAngle.DEFAULT,
    firesDodgableProj: true
  });

  this.util_.addBasicWeapon_(obj, obj.primary, this.util_.proj.laser);
};

PrimaryDecorator.prototype.decorateChargeLaser_ = function(obj, spec)  {
  spec = this.util_.spec(obj, 'primary', spec, {
    miniCooldown: .05,  // Cooldown between projectile shots.
    chargeTime: 2,
    length: 20 + 16,
    speed: g.Speed.VERY_FAST,
    accuracy: g.Accuracy.INACCURATE,
    style: 'strong',
    maxTargetAngle: g.MaxTargetAngle.DEFAULT,
    range: 300,
    movementRatio: .5,
    targetless: true
  });

  spec.charge = 0;
  var charging = false;
  var projectilesRemaining = 0;
  this.util_.addWeapon(obj, spec, function() {
    charging = true;
    this.util_.mod(obj, 'movement.speed', spec.movementRatio);
  }.bind(this));

  this.util_.addCooldown(obj, function(dt) {
    if (charging) chargeLaser(dt);
    if (!charging) return maybeFireLaser();
    return 0 ;
  }.bind(this));

  var chargeLaser = function(dt) {
    spec.charge += dt;
    if (obj.effect.silenced || obj.effect.displaced) {
      stopCharging();
    } else if (spec.charge >= spec.chargeTime) {
      if (!obj.effect.targetlessActive &&
          obj.c.targetAngleDif <= spec.maxTargetAngle) {
        projectilesRemaining = spec.projectiles;
        spec.lastFiredDodgableProj = this.gm_.time;
      }
      stopCharging();
    }
  }.bind(this);

  var stopCharging = function() {
    this.util_.mod(obj, 'movement.speed', 1/spec.movementRatio);
    spec.setAngle = false;
    charging = false;
    spec.charge = 0;
  }.bind(this);

  var maybeFireLaser = function() {
    if (obj.effect.silenced) projectilesRemaining = 0;
    if (projectilesRemaining) {
      var proj = this.util_.fireBasicProj_(obj, spec, this.util_.proj.laser);
      if (!spec.setAngle) {
        proj.awake();
        spec.setAngle = proj.rotation - proj.accuracy;
      }
      projectilesRemaining--;
    }
    return projectilesRemaining && spec.miniCooldown;
  }.bind(this);
};

PrimaryDecorator.prototype.decorateBurstLaser_ = function(obj, spec)  {
  this.util_.spec(obj, 'primary', spec, {
    miniCooldown: .12,
    length: 8 + 16,
    speed: g.Speed.DEFAULT,
    accuracy: g.Accuracy.INACCURATE,
    style: 'weak',
    maxTargetAngle: g.MaxTargetAngle.DEFAULT,
    firesDodgableProj: true
  });

  var projectilesRemaining = 0;
  this.util_.addWeapon(obj, obj.primary, function() {
    projectilesRemaining = obj.primary.projectiles;
  });

  this.util_.addCooldown(obj, function() {
    if (obj.effect.silenced) projectilesRemaining = 0;
    if (projectilesRemaining) {
      this.util_.fireBasicProj_(obj, obj.primary, this.util_.proj.laser);
      projectilesRemaining--;
    }
    return projectilesRemaining && obj.primary.miniCooldown;
  }.bind(this));
};

PrimaryDecorator.prototype.decorateGatling_ = function(obj, spec)  {
  this.util_.spec(obj, 'primary', spec, {
    minCooldownRatio: .17,
    cooldownReduceSpeed: .9,
    length: 8 + 16,
    speed: g.Speed.DEFAULT,
    style: 'weak',
    maxTargetAngle: g.MaxTargetAngle.DEFAULT
  });

  var cooldownRatio = 1;
  this.util_.addWeapon(obj, obj.primary, function() {
    obj.primary.dangle = obj.rotation - obj.c.targetAngle;
    this.util_.fireBasicProj_(obj, obj.primary, this.util_.proj.laser);

    obj.primary.cooldown /= cooldownRatio;
    cooldownRatio *= obj.primary.cooldownReduceSpeed;
    cooldownRatio = Math.max(cooldownRatio, obj.primary.minCooldownRatio);
    obj.primary.cooldown *= cooldownRatio;
    return obj.primary.cooldown;
  }.bind(this));

  obj.act(function(dt) {
    if (obj.primary.jammed) {
      obj.primary.cooldown /= cooldownRatio;
      cooldownRatio = 1;
    }
  }.bind(this));
};
