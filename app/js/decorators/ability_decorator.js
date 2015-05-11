var AbilityDecorator = di.service('AbilityDecorator', [
  'EntityDecorator', 'DecoratorUtil as util', 'ShipFactory',
  'GameModel as gm']);

AbilityDecorator.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'ability');
};

AbilityDecorator.prototype.decorateTank_ = function(obj, spec) {
  this.util_.spec(obj, 'ability', spec, {
    def: 1,
    health: 1
  });

  switch(spec.power) {
  case 3:
  case 2:
    obj.collision.dmg = 0;
  case 1:
    this.util_.mod(obj, 'def', obj.ability.def);
    this.util_.mod(obj, 'health', obj.ability.health);
  }
};

AbilityDecorator.prototype.decorateShield_ = function(obj, spec) {
  this.util_.spec(obj, 'ability', spec, {
    cooldown: 9,
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

  obj.receivedPrecollide(function(proj) {
    if (!obj.effect.shield || proj.type == 'ship') return;
    if (!--obj.ability.charges) obj.effect.shield = 0;
    this.util_.modSet(proj, 'dmg', 0);
  }, this);
};

AbilityDecorator.prototype.decorateReflect_ = function(obj, spec) {
  this.util_.spec(obj, 'ability', spec, {
    duration: 0,
    cooldown: 9,
    effect: 'reflect',
    targetless: true
  });

  switch(spec.power) {
  case 2:
    obj.ability.duration++;
  }

  this.util_.addEffectAbility(obj, obj.ability);

  obj.receivedPrecollide(function(proj) {
    if (!obj.effect.reflect || proj.type == 'ship') return;
    proj.rotate(_.RADIANS_180);
    proj.target = obj.target;
    proj.remainingRange = proj.maxRange;
    proj.shouldCollide = false;
  });
};

AbilityDecorator.prototype.decorateHaze_ = function(obj, spec) {
  this.util_.spec(obj, 'ability', spec, {
    speed: g.Speed.SLOW,
    seek: _.radians(85),
    radius: 3,
    accuracy: 0,
    cooldown: 6,
    range: 300,
    effect: 'haze',
    hazeAccuracy: _.radians(90),
    duration: 4
  });

  switch(spec.power) {
  case 1:
    obj.primary.duration *= 1.5;
    obj.primary.radius *= 1.25;
  }

  this.util_.addBasicWeapon_(obj, obj.ability,
                              this.util_.proj.ball, makeHazable.bind(this));

  function makeHazable(target) {
    if (target.hazable) return;
    target.hazable = true;
    target.prefire(function(proj) {
      if (!target.effect.haze) return;
      this.util_.modAdd(proj, 'movement.accuracy', obj.ability.hazeAccuracy);
    }, this);
  }
};

AbilityDecorator.prototype.decorateKnockback_ = function(obj, spec) {
  this.util_.spec(obj, 'ability', spec, {
    speed: 300,
    cooldown: 4,
    duration: .75,
    effect: 'silenced rooted disabled',
    grow: 500,
    maxRadius: 100,
    range: 100
  });
  obj.ability.maxRange = obj.ability.range;

  switch(spec.power) {
  case 1:
    obj.ability.duration *= 1.3;
  }

  var knockback = function(target) {
    target.addEffect(obj.ability.effect, obj.ability.duration);
    target.addEffect('displaced', obj.ability.duration, function() {
      this.util_.modSet(target, 'movement.speed', null);
    }.bind(this));

    target.movement.vector.x = Math.cos(obj.c.targetAngle);
    target.movement.vector.y = Math.sin(obj.c.targetAngle);
    this.util_.modSet(target, 'movement.speed', obj.ability.speed);
  }.bind(this);

  this.util_.addWeapon(obj, obj.ability, function() {
    this.util_.fireAura(obj, obj.ability);
    for (var i = 0; i < obj.target.clones.length; i++) {
      var clone = obj.target.clones[i];
      if (!clone.dead && _.distance(obj, clone) < obj.ability.range) {
        knockback(clone);
      }
    }
  }.bind(this));
};
