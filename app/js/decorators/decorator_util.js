var DecoratorUtil = di.service('DecoratorUtil', [
  'Entity', 'EntityDecorator', 'GameModel as gm', 'Random']);

DecoratorUtil.prototype.init = function() {
  this.d_ = this.entityDecorator_.getDecorators();

  this.proj = {
    laser: this.fireLaser.bind(this),
    bomb: this.fireBomb.bind(this),
    ball: this.fireBall.bind(this),
    blade: this.fireBlade.bind(this),
    aura: this.fireAura.bind(this)
  };
};

DecoratorUtil.prototype.spec = function(obj, name, overrides, defaults) {
  if (arguments.length == 2) {
    return _.options(obj /* overrides */, name /* defaults */);
  } else {
    obj[name] = _.defaults(_.clone(overrides) || {}, defaults);
    obj[name].name = name;
    obj[name].speed = obj[name].speed || g.Speed.DEFAULT;
    obj[name].accuracy = obj[name].accuracy || g.Accuracy.DEFAULT;
    obj[name].projectiles = obj[name].projectiles || 1;
    obj[name].maxRange = obj[name].maxRange || 9999;
    return obj[name];
  }
};

DecoratorUtil.prototype.addBasicWeapon_ = function(
    obj, spec, fire, opt_onCollision) {
  this.addWeapon(obj, spec, function() {
    return this.fireBasicProj_(obj, spec, fire, opt_onCollision);
  }.bind(this));
};

DecoratorUtil.prototype.fireBasicProj_ = function(
    obj, spec, fire, opt_onCollision) {
  var projectile = fire(obj, spec);
  if (spec.dmg)
    _.decorate(projectile, this.d_.dmgCollision, projectile.spec);
  if (spec.effect)
    _.decorate(projectile, this.d_.effectCollision, projectile.spec);
  projectile.collide(function(target) {
    opt_onCollision && opt_onCollision(target, projectile);
    projectile.dead = true;
  });
};

DecoratorUtil.prototype.addWeapon = function(obj, spec, fire) {
  this.addAbility(obj, spec, function(obj, spec) {
    var overwriteCooldown;
    if (spec.spread) overwriteCooldown = this.fireSpread_(obj, spec, fire);
    else overwriteCooldown = fire(obj, spec);
    return overwriteCooldown == undefined ? spec.cooldown : overwriteCooldown;
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

DecoratorUtil.prototype.addOneTimeAbility = function(obj, spec, ability) {
  var used = false;
  this.addAbility(obj, spec, function() {
    if (used) return Infinity;
    used = true;
    ability(obj, spec);
    return Infinity;
  }.bind(this));
};

DecoratorUtil.prototype.addAbility = function(obj, spec, ability) {
  spec.initCooldown = spec.initCooldown || this.initCooldown(spec.cooldown);
  this.addCooldown(obj, function() {
    spec.jammed = obj.jammed(spec.name);
    if (spec.jammed || (obj.playerControlled && !spec.use)) return 0;
    spec.use = false;
    spec.lastFired = this.gm_.time;
    return this.randomCooldown(ability(obj, spec));
  }.bind(this), spec);
};

DecoratorUtil.prototype.fireSpread_ = function(obj, spec, fire) {
  var overwriteCooldown;
  var spreadPoints = _.geometry.spread(spec.spread, spec.projectiles);
  for (var i = 0; i < spreadPoints.length; i++) {
    // Fire the middle shot first so that it gets the on-fire effects.
    var index = Math.floor(i + spreadPoints.length / 2) % spreadPoints.length;
    spec.dangle = spreadPoints[index];
    var overwrite = fire(obj, spec);
    if (overwriteCooldown == undefined) overwriteCooldown = overwrite;
  }
  return overwriteCooldown;
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
  spec.radius = spec.radius || obj.radius;
  spec.minRadius = spec.minRadius || obj.radius;
  spec.maxRadius = spec.maxRadius || spec.radius;
  _.decorate(aura, this.d_.shape.circle, spec);
  _.decorate(aura, this.d_.movement.atPosition, {target: obj});
  _.decorate(aura, this.d_.growRadiusAndDie, spec);
  return this.gm_.entities.arr[this.gm_.entities.length++] = aura;
};

DecoratorUtil.prototype.fireProjectile_ = function(projectile, obj, spec) {
  projectile.spec = spec;
  projectile.target = obj.target;
  projectile.setPos(obj.x, obj.y);
  _.decorate(projectile, this.d_.collidable);

  obj.prefire(projectile);
  _.decorate(projectile, this.d_.movement.straight, spec);
  _.decorate(projectile, this.d_.removeOffScreen, spec);
  if (spec.range) {
    var range = spec.range * Range.TRAVEL_RATIO;
    _.decorate(projectile, this.d_.range, {range: range});
  }

  this.gm_.entities.arr[this.gm_.entities.length++] = projectile;
  obj.postfire(projectile);
  return projectile;
};

DecoratorUtil.prototype.initCooldown = function(cooldown) {
  return this.random_.nextFloat(.3, .5) * cooldown;
};

DecoratorUtil.prototype.randomCooldown = function(cooldown) {
  return this.random_.nextFloat(.8, 1.2) * cooldown;
};

DecoratorUtil.prototype.addCooldown = function(obj, action, opt_spec) {
  var spec = opt_spec || {};
  spec.cooldownRemaining = spec.initCooldown || 0;
  obj.act(function(dt) {
    if (spec.cooldownRemaining > 0) spec.cooldownRemaining -= dt;
    if (spec.cooldownRemaining <= 0) {
      spec.cooldownRemaining += action() || 0;
    }
  });
};

DecoratorUtil.prototype.modSet = function(obj, prop, value) {
  this.mod_(obj, prop, function() {
    obj.mod[prop].set = value;
  });
};

DecoratorUtil.prototype.modAdd = function(obj, prop, add) {
  this.mod_(obj, prop, function() {
    obj.mod[prop].add += add;
  });
};

DecoratorUtil.prototype.mod = function(obj, prop, multiplier) {
  this.mod_(obj, prop, function() {
    obj.mod[prop].mult *= multiplier;
  });
};

DecoratorUtil.prototype.mod_ = function(obj, prop, modFn) {
  if (!obj.mod) obj.mod = {};
  if (!obj.mod[prop]) obj.mod[prop] = {add: 0, mult: 1, set: null};
  if (obj.awakened) mod();
  else obj.awake(mod);

  function mod() {
    var value = _.parse(obj, prop);
    var modValues = obj.mod[prop];
    if (modValues.baseValue == null) modValues.baseValue = value;
    modFn();

    if (modValues.set != null) {
      value = modValues.set;
    } else {
      if (modValues.baseValue == null) return;
      value = modValues.baseValue * modValues.mult +  modValues.add;
    }
    _.set(obj, prop, value);
  };
};
