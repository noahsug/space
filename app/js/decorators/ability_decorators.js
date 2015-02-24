var AbilityDecorators = di.service('AbilityDecorators', [
  'EntityDecorator', 'DecoratorUtil as util', 'ShipFactory']);

AbilityDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'ability');
};

AbilityDecorators.prototype.decorateShield_ = function(obj, spec) {
  _.spec(obj, 'ability', spec, {
    cooldown: 6,
    effect: 'shield',
    duration: 1000,
    charges: 1,
    targetless: true
  });

  switch(spec.power) {
  case 2:
    obj.ability.charges++;
  case 1:
    obj.ability.charges++;
  }

  this.util_.addEffectAbility(obj, obj.ability);

  obj.maybeShieldDmg = function(source) {
    // Only effects projectiles.
    if (source.type == 'ship') return false;
    if (obj.effect.shield) {
      if (!--obj.ability.charges) {
        obj.effect.shield = 0;
      }
      return true;
    }
    return false;
  };
};

AbilityDecorators.prototype.decorateReflect_ = function(obj, spec) {
  _.spec(obj, 'ability', spec, {
    cooldown: 6,
    effect: 'reflect',
    duration: 1,
    targetless: true
  });

  switch(spec.power) {
  case 2:
    obj.ability.duration++;
  }

  this.util_.addEffectAbility(obj, obj.ability);

  obj.maybeReflect = function(source) {
    if (!obj.effect.reflect) return false;
    if (source.type == 'ship') return false;
    source.rotate && source.rotate(_.RADIANS_180);
    source.target = obj.target;
    source.remainingRange = source.maxRange;
    return true;
  };
};

AbilityDecorators.prototype.decorateHaze_ = function(obj, spec) {
  _.spec(obj, 'ability', spec, {
    speed: 200,
    seek: _.radians(85),
    radius: 4,
    accuracy: 0,
    cooldown: 4,
    range: 300,
    effect: 'haze',
    hazeAccuracy: _.radians(90),
    duration: 2
  });

  switch(spec.power) {
  case 1:
    obj.primary.duration *= 1.5;
    obj.primary.radius *= 1.25;
  }

  this.util_.addEffectWeapon_(obj,
                              obj.ability,
                              this.util_.fireBall.bind(this.util_),
                              makeHazable.bind(this));

  function makeHazable() {
    obj.target.maybeApplyHaze = function(projectile, target, spec) {
      if (target.effect.haze) {
        this.util_.set(
            projectile, 'movement.accuracy', obj.ability.hazeAccuracy);
      }
    }.bind(this);
  }
};

AbilityDecorators.prototype.decorateKnockback_ = function(obj, spec) {
  _.spec(obj, 'ability', spec, {
    speed: 300,
    cooldown: 6,
    duration: .25,
    effect: 'stunned',
    knockback: 500,
    grow: 500,
    growDuration: .1,
    range: 100
  });

  switch(spec.power) {
  case 1:
    obj.ability.duration *= 1.3;
  }

  var knockback = function(target) {
    target.addEffect(obj.ability.effect, obj.ability.duration);
    target.movement.vector.x = Math.cos(obj.c.targetAngle);
    target.movement.vector.y = Math.sin(obj.c.targetAngle);
    var ratio = obj.ability.knockback / (obj.movement.speed || 1);
    target.movement.speed *= ratio;
    target.addEffect('knockback', obj.ability.duration, function() {
      target.movement.speed /= ratio;
    }.bind(this));
  }.bind(this);

  this.util_.addWeapon(obj, obj.ability, function() {
    this.util_.fireAura(obj, obj.ability);
    knockback(obj.target);
    for (var i = 0; i < obj.target.clones; i++) {
      var clone = obj.target.clones[i];
      if (!clone.dead && _.distance(obj, clone) < obj.ability.range) {
        knockback(clone);
      }
    }
  }.bind(this));
};
