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

  this.util_.addBasicWeapon_(obj, obj.primary, this.util_.proj.bomb);
};

PrimaryDecorator.prototype.decorateBasicLaser_ = function(obj, spec) {
  this.util_.spec(obj, 'primary', spec, {
    length: 8 + 16
  });

  this.util_.addBasicWeapon_(obj, obj.primary, this.util_.proj.laser);
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

  this.util_.addBasicWeapon_(obj, obj.primary, this.util_.proj.laser);
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

  this.util_.addBasicWeapon_(obj, obj.primary, this.util_.proj.blade);
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

  this.util_.addBasicWeapon_(obj, obj.primary, this.util_.proj.blade);
};

PrimaryDecorator.prototype.decorateSniper_ = function(obj, spec) {
  this.util_.spec(obj, 'primary', spec, {
    length: 20 + 16,
    speed: Speed.VERY_FAST,
    accuracy: Accuracy.ACCURATE
  });

  this.util_.addBasicWeapon_(obj, obj.primary, this.util_.proj.laser);
};

PrimaryDecorator.prototype.decorateBurstLaser_ = function(obj, spec)  {
  this.util_.spec(obj, 'primary', spec, {
    miniCooldown: .12,
    length: 8 + 16,
    speed: Speed.DEFAULT,
    accuracy: Accuracy.INACCURATE,
    style: 'weak'
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
    cooldownReduceSpeed: .4,
    length: 8 + 16,
    speed: Speed.DEFAULT,
    style: 'weak',
    breakPoint: _.radians(90),
    turnSpeed: _.radians(35)
  });

  var angle = 0;
  var cooldownRatio = 1;
  var firing = false;
  obj.awake(function(dt) {
    angle = _.angle(obj, obj.target);
  });
  obj.act(function(dt) {
    var da = _.angleDif(angle, obj.c.targetAngle);
    if (da > obj.primary.breakPoint) {
      obj.primary.cooldown /= cooldownRatio;
      cooldownRatio = 1;
      angle = obj.c.targetAngle;
      firing = false;
    } else if (firing) {
      angle = _.approachAngle(
          angle, obj.c.targetAngle, obj.primary.turnSpeed * dt);
      obj.primary.cooldown /= cooldownRatio;
      cooldownRatio *= 1 - obj.primary.cooldownReduceSpeed * dt;
      cooldownRatio = Math.max(cooldownRatio, obj.primary.minCooldownRatio);
      obj.primary.cooldown *= cooldownRatio;
    }
  });

  this.util_.addWeapon(obj, obj.primary, function() {
    if (!firing) firing = true;
    obj.primary.dangle = angle - obj.c.targetAngle;
    this.util_.fireBasicProj_(obj, obj.primary, this.util_.proj.laser);
  }.bind(this));
};
