var AbilityDecorators = di.service('AbilityDecorators', [
  'EntityDecorator', 'DecoratorUtil as util', 'ShipFactory']);

AbilityDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'ability');
};

AbilityDecorators.prototype.decorateMink_ = function(obj, spec) {
  _.spec(obj, 'ability', spec, {
    radius: .7,
    speed: 1.3,
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

AbilityDecorators.prototype.decorateInvisible_ = function(obj, spec) {
  _.spec(obj, 'ability', spec, {
    cooldown: 6,
    effect: 'invisible',
    duration: 2,
    targetless: true
  });

  switch(spec.power) {
  case 2:
    obj.ability.duration++;
  }

  obj.resolve(function() {
    if (obj.effect.invisible &&
        obj.health < obj.prevHealth &&
        obj.ability.duration - obj.effect.invisible > .5) {
      obj.effect.invisible = 0;
    }
  });

  this.util_.addEffectAbility(obj, obj.ability);
};

AbilityDecorators.prototype.decorateSplit_ = function(obj, spec) {
  _.spec(obj, 'ability', spec, {
    cooldown: 6
  });

  obj.resolve(function(dt) {
    if (obj.health < obj.prevHealth) split.call(this, dt);
  }.bind(this));

  function split(dt) {
    var newDna = [];
    for (var i = 0; i < obj.dna.length; i++) {
      var item = obj.dna[i];
      if (item.id == 'ability.split') continue;
      if (item.id == 'shape.circle') item.spec.radius *= .85;
      if (item.dmg) item.spec.dmg /= 2;
      newDna.push(item);
    }

    var s1 = this.shipFactory_.createShip_(newDna, obj.style);
    var s2 = this.shipFactory_.createShip_(newDna, obj.style);
    s1.x = obj.x + 10;
    s1.y = obj.y + 10;
    s2.x = obj.x - 10;
    s2.y = obj.y - 10;
    this.shipFactory_.setTargets(s1, obj.target);
    this.shipFactory_.setTargets(s2, obj.target);

    s1.setMaxHealth(obj.health);
    s2.setMaxHealth(obj.health);
    obj.dead = obj.remove = true;
    obj.clones = [s1, s2];
    s1.clones = [s2];
    s2.clones = [s1];

    s1.act(dt);
    s2.act(dt);
  };
};
