var UtilityDecorators = di.service('UtilityDecorators', [
  'EntityDecorator', 'Random', 'Screen', 'DecoratorUtil as util',
  'SharedComputation as c']);

UtilityDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'utility');
};

UtilityDecorators.prototype.decorateDruid_ = function(obj, spec) {
  switch(spec.power) {
  case 3:
    this.decorateSplit_(obj, spec);
    break;
  case 2:
    this.decorateRage_(obj, spec);
    break;
  case 1:
    this.decorateMink_(obj, spec);
  }
};

UtilityDecorators.prototype.decorateMink_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    radiusMod: .75,
    speedMod: 1.3
  });

  this.util_.mod(obj, 'speed', obj.utility.speedMod);
  this.util_.mod(obj, 'radius', obj.utility.radiusMod);
};

UtilityDecorators.prototype.decorateRage_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    radiusMod: 1.5,
    dmgMod: 2
  });

  this.util_.mod(obj, 'primary.dmg', obj.utility.dmgMod);
  this.util_.mod(obj, 'radius', obj.utility.radiusMod);
};

UtilityDecorators.prototype.decorateSplit_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    cooldown: 6,
    dmgRatio: .5
  });

  var delay = 3;
  obj.resolve(function(dt) {
    if (delay--) return;
    split(dt);
  }.bind(this));

  var split = function(dt) {
    var dna = getCloneDna(obj);
    var s1 = obj.addClone(dna);
    var s2 = obj.addClone(dna);

    modClone(s1);
    modClone(s2);

    s1.x = obj.x + 10;
    s1.y = obj.y + 10;
    s2.x = obj.x - 10;
    s2.y = obj.y - 10;

    obj.dead = obj.remove = true;
    s1.act(dt);
    s2.act(dt);
  }.bind(this);

  var getCloneDna = function(obj) {
    return _.newList(obj.dna, function(item) {
      if (item.category == 'utility') return undefined;
      return item;
    });
  }.bind(this);

  var modClone = function(clone) {
    this.util_.mod(clone, 'radius', .85);
    this.util_.mod(clone, 'primary.dmg', obj.utility.dmgRatio);
    this.util_.mod(clone, 'secondary.dmg', obj.utility.dmgRatio);
    this.util_.mod(clone, 'ability.dmg', obj.utility.dmgRatio);
    this.util_.mod(clone, 'utility.dmg', obj.utility.dmgRatio);
    this.util_.mod(clone, 'primary.dmgRatio', obj.utility.dmgRatio);
    this.util_.mod(clone, 'secondary.dmgRatio', obj.utility.dmgRatio);
    this.util_.mod(clone, 'ability.dmgRatio', obj.utility.dmgRatio);
    this.util_.mod(clone, 'utility.dmgRatio', obj.utility.dmgRatio);
    this.util_.mod(clone, 'health', .5);
  }.bind(this);
};

UtilityDecorators.prototype.decorateRanger_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    range: 1,
    seek: 0,
    accuracy: 1
  });

  this.util_.modAdd(obj, 'primary.seek', obj.utility.seek);
  this.util_.modAdd(obj, 'secondary.seek', obj.utility.seek);
  this.util_.mod(obj, 'primary.accuracy', obj.utility.accuracy);
  this.util_.mod(obj, 'secondary.accuracy', obj.utility.accuracy);
  this.util_.mod(obj, 'primary.range', obj.utility.range);
  this.util_.mod(obj, 'secondary.range', obj.utility.range);
};

UtilityDecorators.prototype.decorateNinja_ = function(obj, spec) {
  switch(spec.power) {
  case 3:
    this.decorateInvisible_(obj, obj.utility);
    break;
  case 2:
    this.decorateTeleport_(obj, obj.utility);
    break;
  case 1:
    this.decorateDash_(obj, obj.utility);
  }
};

UtilityDecorators.prototype.decorateDash_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    cooldown: 1.5,
    duration: .1,
    accel: .05,
    dashSpeed: 4.5
  });

  obj.addEffect('dashCooldown', obj.utility.cooldown);
  obj.act(function(dt) {
    obj.utility.dashReady = !obj.effect.dashCooldown && obj.effect.canDash;
  });

  obj.utility.useDash = function() {
    obj.addEffect('dash', obj.utility.duration, obj.utility.stopDash);
    obj.utility.dashReady = false;
    obj.effect.dashCooldown = this.util_.randomCooldown(obj.utility.cooldown);
    obj.movement.vector = obj.movement.desiredVector;
    obj.movement.accel *= obj.utility.accel;
    obj.movement.speed *= obj.utility.dashSpeed;
  }.bind(this);

  obj.utility.stopDash = function() {
    obj.movement.vector = {x: 0, y: 0};
    obj.movement.accel /= obj.utility.accel;
    obj.movement.speed /= obj.utility.dashSpeed;
    if (!PROD) _.assert(_.isDef(obj.effect.dash));
    obj.effect.dash = 0;
  };
};

UtilityDecorators.prototype.decorateTeleport_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    cooldown: 6,
    range: 300
  });

  obj.addEffect('teleportCooldown', obj.utility.cooldown);
  obj.act(function(dt) {
    if (!obj.effect.canDash ||
        obj.effect.teleportCooldown ||
        obj.c.targetDis > obj.utility.range) {
      obj.utility.teleportReady = false;
      return;
    }
    obj.utility.teleportPos = {
      x: obj.target.x + Math.cos(obj.c.targetAngle) * 60,
      y: obj.target.y + Math.sin(obj.c.targetAngle) * 60
    };
    obj.utility.teleportReady = !this.c_.hitWall(obj.utility.teleportPos);
  }.bind(this));

  obj.utility.useTeleport = function() {
    obj.effect.teleportCooldown =
        this.util_.randomCooldown(obj.utility.cooldown);
    obj.movement.vector = {x: 0, y: 0};
    obj.x = obj.utility.teleportPos.x;
    obj.y = obj.utility.teleportPos.y;
  }.bind(this);
};

UtilityDecorators.prototype.decorateInvisible_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    cooldown: 6,
    effect: 'invisible',
    duration: 2,
    speedMod: .5,
    targetless: true
  });

  this.util_.addEffectAbility(obj, obj.utility);
};
