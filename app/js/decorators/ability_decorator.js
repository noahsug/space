var AbilityDecorator = di.service('AbilityDecorator', [
  'EntityDecorator', 'DecoratorUtil as util', 'ShipFactory',
  'GameModel as gm']);

AbilityDecorator.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'ability');
  this.name_ = 'ability';
};

AbilityDecorator.prototype.decorateTank_ = function(obj, spec) {
  this.util_.spec(obj, this.name_, spec, {
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
  this.util_.spec(obj, this.name_, spec, {
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

  obj.receivedCollide(function(proj) {
    if (!obj.effect.shield || proj.type == 'ship') return;
    if (!--obj.ability.charges) obj.effect.shield = 0;
    this.util_.modSet(proj, 'dmg', 0);
  }, this);
};

AbilityDecorator.prototype.decorateReflect_ = function(obj, spec) {
  this.util_.spec(obj, this.name_, spec, {
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

AbilityDecorator.prototype.decoratePoof_ = function(obj, spec) {
  spec = this.util_.spec(obj, this.name_, spec, {
    duration: 0,
    effect: 'exiled invisible silenced rooted',
    targetless: true
  });

  spec.isJammed = function() {
    return obj.effect['exiled'];
  };

  obj.receivedPrecollide(function(proj) {
    if (obj.effect.exiled) proj.shouldCollide = false;
  });

  this.util_.addWeapon(obj, spec, function() {
    obj.addEffect(spec.effect, spec.duration);
    obj.movement.vector = {x: 0, y: 0};
  });
};

AbilityDecorator.prototype.decorateHaze_ = function(obj, spec) {
  this.util_.spec(obj, this.name_, spec, {
    speed: g.Speed.SLOW,
    seek: _.radians(85),
    radius: 3,
    accuracy: 0,
    cooldown: 6,
    range: 300,
    effect: 'haze',
    hazeAccuracy: _.radians(90),
    duration: 4,
    firesDodgableProj: true
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
