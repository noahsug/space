var DecoratorUtil = di.service('DecoratorUtil', [
  'Entity', 'EntityDecorator', 'GameModel as gm', 'Random']);

DecoratorUtil.prototype.init = function() {
  this.d_ = this.entityDecorator_.getDecorators();
};

DecoratorUtil.prototype.addEffectWeapon_ = function(
    obj, spec, fire, opt_onCollide) {
  this.addWeapon(obj, spec, function() {
    var projectile = fire(obj, spec);
    spec.collide = function(proj) {
      proj.target.addEffect(spec.effect, spec.duration);
      if (spec.dmg) proj.target.dmg(spec.dmg);
      opt_onCollide && opt_onCollide(proj);
      proj.dead = true;
    }.bind(this);
    _.decorate(projectile, this.d_.collision, spec);
  }.bind(this));
};

DecoratorUtil.prototype.addDmgWeapon_ = function(
    obj, spec, fire) {
  this.addWeapon(obj, spec, function() {
    var projectile = fire(obj, spec);
    _.decorate(projectile, this.d_.dmgCollision, obj.primary);
  }.bind(this));
};

DecoratorUtil.prototype.addWeapon = function(obj, spec, fire) {
  this.addAbility(obj, spec, function(obj, spec) {
    if (spec.spread) this.fireSpread_(obj, spec, fire);
    else fire(obj, spec);
    return spec.cooldown;
  }.bind(this));
};

DecoratorUtil.prototype.addEffectAbility = function(obj, spec) {
  spec.maxCharges = spec.charges;
  this.addAbility(obj, spec, function() {
    if (obj.effect[spec.effect]) return 0;
    obj.addEffect(spec.effect, spec.duration);
    spec.charges = spec.maxCharges;
    return spec.cooldown;
  });
};

DecoratorUtil.prototype.addAbility = function(obj, spec, ability) {
  this.addCooldown(obj, function() {
    if (obj.dead || obj.effect.silenced) return 0;
    if (obj.effect.targetlessActive && !spec.targetless) return 0;
    if (spec.range && obj.c.targetDis > spec.range) return 0;
    if (obj.c.targetDis < spec.minRange) return 0;
    spec.lastFired = this.gm_.time;
    var cooldown = ability(obj, spec);
    return this.randomCooldown(cooldown);
  }.bind(this), this.initCooldown(spec.cooldown));
};

DecoratorUtil.prototype.fireSpread_ = function(obj, spec, fire) {
  var spreadPoints = _.geometry.spread(spec.spread, spec.projectiles);
  for (var i = 0; i < spreadPoints.length; i++) {
    // Fire the middle shot first so that it gets the on-fire effects.
    var index = Math.floor(i + spreadPoints.length / 2) % spreadPoints.length;
    spec.dangle = spreadPoints[index];
    fire(obj, spec);
  }
};

DecoratorUtil.prototype.fireLaser = function(obj, spec) {
  var laser = this.entity_.create('laser');
  laser.style = spec.style;
  _.decorate(laser, this.d_.shape.line, spec);
  return this.fireProjectile_(laser, obj, spec);
};

DecoratorUtil.prototype.fireBomb = function(obj, spec) {
  var bomb = this.entity_.create('bomb');
  bomb.style = spec.style;
  _.decorate(bomb, this.d_.shape.circle, spec);
  return this.fireProjectile_(bomb, obj, spec);
};

DecoratorUtil.prototype.fireBall = function(obj, spec) {
  var bomb = this.entity_.create('ball');
  bomb.style = spec.style;
  _.decorate(bomb, this.d_.shape.circle, spec);
  return this.fireProjectile_(bomb, obj, spec);
};

DecoratorUtil.prototype.fireBlade = function(obj, spec) {
  var blade = this.entity_.create('blade');
  blade.style = spec.style;
  _.decorate(blade, this.d_.shape.circle, spec);
  return this.fireProjectile_(blade, obj, spec);
};

DecoratorUtil.prototype.fireAura = function(obj, spec) {
  var aura = this.entity_.create('aura');
  aura.style = spec.style;
  spec.radius = obj.radius;
  _.decorate(aura, this.d_.shape.circle, spec);
  aura.target = obj.target;
  _.decorate(aura, this.d_.movement.atPosition, {target: obj});
  _.decorate(aura, this.d_.growRadiusAndDie, spec);
  return this.gm_.entities.arr[this.gm_.entities.length++] = aura;
};

var EXTRA_RANGE_RATIO = 1.5;
DecoratorUtil.prototype.fireProjectile_ = function(projectile, obj, spec) {
  projectile.target = obj.target;
  projectile.setPos(obj.x, obj.y);

  obj.maybeTrackTarget && obj.maybeTrackTarget(projectile, spec);
  obj.maybeApplyHaze && obj.maybeApplyHaze(projectile, obj, spec);

  _.decorate(projectile, this.d_.movement.straight, spec);
  _.decorate(projectile, this.d_.removeOffScreen, spec);
  if (spec.range) {
    var range = spec.range * EXTRA_RANGE_RATIO;
    _.decorate(projectile, this.d_.range, {range: range});
  }

  return this.gm_.entities.arr[this.gm_.entities.length++] = projectile;
};

DecoratorUtil.prototype.initCooldown = function(cooldown) {
  return this.random_.nextFloat(.5) * cooldown;
};

DecoratorUtil.prototype.randomCooldown = function(cooldown) {
  return this.random_.nextFloat(.8, 1.2) * cooldown;
};

DecoratorUtil.prototype.addCooldown = function(obj, action, opt_initCooldown) {
  var cooldown = opt_initCooldown || 0;
  obj.act(function(dt) {
    if (cooldown > 0) cooldown -= dt;
    if (cooldown <= 0) {
      cooldown += action() || 0;
    }
  });
};

DecoratorUtil.prototype.set = function(obj, prop, add) {
  obj.awake(function() {
    var value = _.parse(obj, prop) || 0;
    _.set(obj, prop, value + add);
  });
};

DecoratorUtil.prototype.mod = function(obj, prop, multiplier) {
  if (obj.awakened) {
    var value = _.parse(obj, prop) || 0;
    _.set(obj, prop, value * multiplier);
  } else {
    obj.awake(this.mod.bind(this, obj, prop, multiplier));
  }
};
