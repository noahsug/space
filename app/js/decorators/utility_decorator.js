var UtilityDecorator = di.service('UtilityDecorator', [
  'EntityDecorator', 'Random', 'Screen', 'DecoratorUtil as util',
  'SharedComputation as c', 'GameModel as gm']);

UtilityDecorator.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'utility');
};

UtilityDecorator.prototype.decorateSticky_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    slow: .75,
    maxStacks: 5,
    duration: 1
  });

  obj.prefire(function(proj) {
    if (proj.spec.name == 'ability') return;

    proj.collide(function(target) {
      if (!target.slowStacks) target.slowStacks = 0;
      if (target.slowStacks < obj.utility.maxStacks) target.slowStacks++;
      var slow = Math.pow(obj.utility.slow, target.slowStacks);
      target.addEffect('slowed', obj.utility.duration, function() {
        this.util_.mod(target, 'movement.speed', 1/slow);
      }.bind(this));
      this.util_.mod(target, 'movement.speed', slow);
    }, this);
  }, this);
};

UtilityDecorator.prototype.decorateRefresh_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    cooldownReduction: 4,
    cooldown: 10
  });

  var specNames = _.without(Game.ITEM_TYPES, 'utility');
  this.util_.addWeapon(obj, obj.utility, function() {
    _.each(specNames, reduceCooldown);
  });

  function reduceCooldown(type) {
    var spec = obj[type];
    if (spec.cooldownRemaining < 0) return;
    spec.cooldownRemaining -= obj.utility.cooldownReduction;
    if (spec.cooldownRemaining < 0) spec.cooldownRemaining = 0;
  };
};

UtilityDecorator.prototype.decorateDruid_ = function(obj, spec) {
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

UtilityDecorator.prototype.decorateMink_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    radiusMod: .75,
    speedMod: 1.15
  });

  this.util_.addOneTimeAbility(obj, obj.utility, function() {
    this.util_.mod(obj, 'movement.speed', obj.utility.speedMod);
    this.util_.mod(obj, 'radius', obj.utility.radiusMod);
  }.bind(this));
};

UtilityDecorator.prototype.decorateRage_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    radiusMod: 1.5,
    dmgMod: 2,
    cooldown: 1
  });

  this.util_.addOneTimeAbility(obj, obj.utility, function() {
    this.util_.mod(obj, 'primary.dmg', obj.utility.dmgMod);
    this.util_.mod(obj, 'radius', obj.utility.radiusMod);
  }.bind(this));
};

UtilityDecorator.prototype.decorateSplit_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    cooldown: 1,
    dmgRatio: .5
  });

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

  this.util_.addOneTimeAbility(obj, obj.utility, function() {
    split();
  }.bind(this));
};

UtilityDecorator.prototype.decorateRanger_ = function(obj, spec) {
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

UtilityDecorator.prototype.decorateDash_ = function(obj, spec) {
  spec = this.util_.spec(obj, 'utility', spec, {
    cooldown: 1.75,
    duration: .25,
    accel: .05,
    speed: 300,
    movementRatio: 1.2
  });

  this.util_.mod(obj, 'movement.speed', spec.movementRatio);

  spec.isJammed = function() { return !obj.effect.canDash; };

  if (obj.playerControlled) {
    this.util_.addWeapon(obj, spec, function() {
      dash();
    }.bind(this));

  } else {
    obj.addEffect('dashCooldown', spec.cooldown);
    obj.act(function(dt) {
      spec.dashReady =
          !obj.effect.dashCooldown && !spec.isJammed();
    });

    spec.useDash = function() {
      dash();
      spec.dashReady = false;
      obj.effect.dashCooldown = this.util_.randomCooldown(spec.cooldown);
    }.bind(this);
  }

  var dash = function() {
    obj.addEffect('displaced', spec.duration, stopDash);
    obj.movement.vector = obj.movement.desiredVector;
    this.util_.modSet(obj, 'movement.speed', spec.speed);
    this.util_.mod(obj, 'movement.accel', spec.accel);
  }.bind(this);

  var stopDash = function() {
    obj.movement.vector = {x: 0, y: 0};
    this.util_.mod(obj, 'movement.accel', 1/spec.accel);
    this.util_.modSet(obj, 'movement.speed', null);
  }.bind(this);
};

UtilityDecorator.prototype.decorateTeleport_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    cooldown: 6,
    range: 300
  });

  obj.utility.isJammed = function() {
    if (!obj.effect.canDash) return true;
    obj.utility.teleportPos = {
      x: obj.target.x + Math.cos(obj.c.targetAngle) *
          (obj.target.radius + obj.radius + 30),
      y: obj.target.y + Math.sin(obj.c.targetAngle) *
          (obj.target.radius + obj.radius + 30)
    };
    return this.c_.hitWall(obj.utility.teleportPos, obj.collideDis);
  }.bind(this);

  if (obj.playerControlled) {
    this.util_.addWeapon(obj, obj.utility, function() {
      teleport();
    }.bind(this));

  } else {
    obj.addEffect('teleportCooldown', obj.utility.cooldown);
    obj.act(function(dt) {
      obj.utility.teleportReady =
          !obj.effect.teleportCooldown && !obj.utility.isJammed();
    });

    obj.utility.useTeleport = function() {
      teleport();
      obj.utility.teleportReady = false;
    }.bind(this);
  }

  obj.utility.useTeleport = function() {
    obj.effect.teleportCooldown =
        this.util_.randomCooldown(obj.utility.cooldown);
    teleport();
  }.bind(this);

  var teleport = function() {
    obj.movement.vector = {x: 0, y: 0};
    obj.x = obj.utility.teleportPos.x;
    obj.y = obj.utility.teleportPos.y;
    obj.rotation = obj.c.targetAngle + Math.PI;
  }.bind(this);
};

UtilityDecorator.prototype.decorateInvisible_ = function(obj, spec) {
  this.util_.spec(obj, 'utility', spec, {
    cooldown: 6,
    dmgRatio: 1.5,
    dmgDuration: .5,
    effect: 'invisible',
    duration: 2,
    speedMod: .5,
    targetless: true
  });

  obj.utility.isJammed = function() {
    return obj.effect[obj.utility.effect];
  };

  this.util_.addAbility(obj, obj.utility, function() {
    obj.addEffect(obj.utility.effect, obj.utility.duration, moreDamage);
    return obj.utility.cooldown;
  });

  var moreDamage = function() {
    obj.addEffect('outOfStealth', obj.utility.dmgDuration, function() {
      _.each(Game.ITEM_TYPES, function(type) {
        this.util_.mod(obj, type + '.dmg', 1 / obj.utility.dmgRatio);
      }, this);
    }.bind(this));

    _.each(Game.ITEM_TYPES, function(type) {
      this.util_.mod(obj, type + '.dmg', obj.utility.dmgRatio);
    }, this);
  }.bind(this);
};
