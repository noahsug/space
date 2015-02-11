var DecoratorUtil = di.service('DecoratorUtil', [
  'Entity', 'EntityDecorator', 'GameModel as gm', 'Random']);

DecoratorUtil.prototype.addWeapon = function(obj, spec, fire) {
  var initCooldown = this.random_.nextFloat(.5) * spec.cooldown;
  this.onCooldown(obj, function() {
    if (obj.dead || obj.effect.silenced) return 0;
    if (spec.range && obj.c.targetDis > spec.range) return 0;
    if (obj.c.targetDis < spec.minRange) return 0;
    if (spec.spread) this.fireSpread_(obj, spec, fire);
    else fire(obj, spec);
    spec.lastFired = this.gm_.time;
    return this.randomCooldown(spec.cooldown);
  }.bind(this), initCooldown);
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
  var d = this.entityDecorator_.getDecorators();
  var laser = this.entity_.create('laser');
  laser.style = spec.style;
  _.decorate(laser, d.shape.line, spec);
  return this.fireProjectile_(laser, obj, spec);
};

DecoratorUtil.prototype.fireBomb = function(obj, spec) {
  var d = this.entityDecorator_.getDecorators();
  var bomb = this.entity_.create('bomb');
  bomb.style = spec.style;
  _.decorate(bomb, d.shape.circle, spec);
  return this.fireProjectile_(bomb, obj, spec);
};

DecoratorUtil.prototype.fireBlade = function(obj, spec) {
  var d = this.entityDecorator_.getDecorators();
  var blade = this.entity_.create('blade');
  blade.style = spec.style;
  _.decorate(blade, d.shape.circle, spec);
  return this.fireProjectile_(blade, obj, spec);
};

DecoratorUtil.prototype.fireAura = function(obj, spec) {
  var d = this.entityDecorator_.getDecorators();
  var aura = this.entity_.create('aura');
  aura.style = spec.style;
  spec.radius = obj.radius;
  _.decorate(aura, d.shape.circle, spec);
  aura.target = obj.target;
  _.decorate(aura, d.movement.atPosition, {target: obj});
  _.decorate(aura, d.growRadiusAndDie, spec);
  return this.gm_.entities.arr[this.gm_.entities.length++] = aura;
};

var EXTRA_RANGE_RATIO = 1.5;
DecoratorUtil.prototype.fireProjectile_ = function(projectile, obj, spec) {
  projectile.target = obj.target;
  projectile.setPos(obj.x, obj.y);

  if (projectile.target.effect.tagged && spec.name == 'primary') {
    projectile.target.effect.tagged = 0;
    this.set(projectile, 'movement.seek', obj.secondary.taggedSeek);
  }

  var d = this.entityDecorator_.getDecorators();
  _.decorate(projectile, d.movement.straight, spec);
  _.decorate(projectile, d.removeOffScreen, spec);
  if (spec.range) {
    var range = spec.range * EXTRA_RANGE_RATIO;
    _.decorate(projectile, d.range, {range: range});
  }

  return this.gm_.entities.arr[this.gm_.entities.length++] = projectile;
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

DecoratorUtil.prototype.randomCooldown = function(cooldown) {
  return this.random_.nextFloat(.8, 1.2) * cooldown;
};

DecoratorUtil.prototype.onCooldown = function(obj, act, opt_initCooldown) {
  return new EntityCooldown(obj, act, opt_initCooldown);
};

var EntityCooldown = function(obj, act, opt_initCooldown) {
  this.cooldown_ = opt_initCooldown || 0;
  this.act_ = act;
  this.obj_ = obj;
  obj.act(this.update_.bind(this, obj));
};

EntityCooldown.prototype.set = function(cooldown) {
  this.cooldown_ = cooldown;
};

EntityCooldown.prototype.update_ = function(obj, dt) {
  // TODO: Move stun check out into passed in function.
  if (this.cooldown_ > 0) this.cooldown_ -= dt;
  if (this.cooldown_ <= 0) {
    var newCooldown = this.act_();
    this.cooldown_ += _.ifDef(newCooldown, 0);
  }
};
