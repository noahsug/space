var AbilityDecorators = di.service('AbilityDecorators', [
  'EntityDecorator', 'DecoratorUtil as util']);

AbilityDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'ability');
};

AbilityDecorators.prototype.decorateMink_ = function(obj, spec) {
  _.spec(obj, 'ability', spec, {
    radius: .7,
    speed: 1.3
  });

  this.util_.mod(obj, 'speed', obj.ability.speed);
  this.util_.mod(obj, 'radius', obj.ability.radius);
};

AbilityDecorators.prototype.decorateRage_ = function(obj, spec) {
  _.spec(obj, 'ability', spec, {
    radius: 1.5,
    dmg: 1.5,
    enrageHealth: .5
  });

  switch(spec.power) {
  case 2:
    obj.ability.enrageHealth *= .5;
    obj.ability.radius *= 1.1;
    obj.ability.dmg *= 1.2;
  case 1:
    obj.ability.radius *= 1.1;
    obj.ability.dmg *= 1.2;
  }

  obj.resolve(function() {
    var enrage = obj.maxHealth * obj.ability.enrageHealth;
    if (obj.health <= enrage && obj.prevHealth > enrage) {
      obj.radius *= obj.ability.radius;
      if (obj.primary) obj.primary.dmg *= obj.ability.dmg;
      if (obj.secondary) obj.secondary.dmg *= obj.ability.dmg;
      return;
    }

    if (obj.health > enrage && obj.prevHealth <= enrage) {
      this.util_.mod(obj, 'radius', 1 / obj.ability.radius);
      this.util_.mod(obj, 'primary.dmg', 1 / obj.ability.dmg);
      this.util_.mod(obj, 'secondary.dmg', 1 / obj.ability.dmg);
      return;
    }
  }.bind(this));
};

AbilityDecorators.prototype.decorateShield_ = function(obj, spec) {
  _.spec(obj, 'ability', spec, {
    cooldown: 6,
    effect: 'shield',
    duration: 1000,
    charges: 1
  });

  switch(spec.power) {
  case 2:
    obj.ability.charges++;
  case 1:
    obj.ability.charges++;
  }
  obj.ability.maxCharges = obj.ability.charges;

  this.util_.addAbility(obj, obj.ability, function(obj, spec) {
    if (obj.effect.shield) return 0;
    obj.addEffect(obj.ability.effect, obj.ability.duration);
    obj.ability.charges = obj.ability.maxCharges;
    return obj.ability.cooldown;
  });

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
    duration: 1
  });

  switch(spec.power) {
  case 2:
    obj.ability.duration++;
  }

  this.util_.addAbility(obj, obj.ability, function(obj, spec) {
    if (obj.effect.reflect) return 0;
    obj.addEffect(obj.ability.effect, obj.ability.duration);
    return obj.ability.cooldown;
  });

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
    duration: 1.5
  });

  switch(spec.power) {
  case 1:
    obj.primary.duration *= 1.5;
    obj.primary.radius *= 1.25;
  }

  this.util_.addEffectWeapon_(obj,
                              obj.ability,
                              this.util_.fireBall.bind(this.util_));
};
