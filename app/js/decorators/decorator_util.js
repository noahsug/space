var DecoratorUtil = di.service('DecoratorUtil', [
  'Entity', 'EntityDecorator', 'GameModel as gm']);

DecoratorUtil.prototype.addWeapon = function(obj, spec, fire) {
  this.onCooldown(obj, function() {
    if (obj.dead) return 0;
    if (spec.range && obj.c.targetDis > spec.range) return 0;
    if (spec.spread) this.fireSpread_(obj, spec, fire);
    else fire(obj, spec);
    spec.lastFired = this.gm_.time;
    return spec.cooldown;
  }.bind(this));
};

DecoratorUtil.prototype.fireSpread_ = function(obj, spec, fire) {
  if (!obj.spreadPoints) {
    // Save some time by only computing spread once.
    obj.spreadPoints = _.geometry.spread(spec.spread, spec.projectiles);
  }
  for (var i = 0; i < obj.spreadPoints.length; i++) {
    spec.dangle = obj.spreadPoints[i];
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

var EXTRA_RANGE_RATIO = 1.5;
DecoratorUtil.prototype.fireProjectile_ = function(projectile, obj, spec) {
  var d = this.entityDecorator_.getDecorators();
  projectile.setPos(obj.x, obj.y);
  _.decorate(projectile, d.movement.straight, spec);
  _.decorate(projectile, d.removeOffScreen, spec);
  if (spec.range) {
    var range = spec.range * EXTRA_RANGE_RATIO;
    _.decorate(projectile, d.range, {range: range});
  }
  projectile.target = obj.target;
  return this.gm_.entities.arr[this.gm_.entities.length++] = projectile;
};

DecoratorUtil.prototype.mod = function(obj, prop, multiplier) {
  if (obj.awakened) {
    var value = _.parse(obj, prop);
    _.set(obj, prop, value * multiplier);
  } else {
    obj.awake(this.mod.bind(this, obj, prop, multiplier));
  }
};

DecoratorUtil.prototype.onCooldown = function(obj, act) {
  return new EntityCooldown(obj, act);
};

var EntityCooldown = function(obj, act) {
  this.cooldown_ = 0;
  this.act_ = act;
  this.obj_ = obj;
  obj.act(this.update_.bind(this, obj));
};

EntityCooldown.prototype.set = function(cooldown) {
  this.cooldown_ = cooldown;
};

EntityCooldown.prototype.update_ = function(obj, dt) {
  if (obj.effects.stunned.value || obj.effects.weaponsDisabled.value) return;
  if (this.cooldown_ > 0) this.cooldown_ -= dt;
  if (this.cooldown_ <= 0) {
    var newCooldown = this.act_();
    this.cooldown_ += _.ifDef(newCooldown, 0);
  }
};
