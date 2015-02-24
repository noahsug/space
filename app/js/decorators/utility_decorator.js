var UtilityDecorators = di.service('UtilityDecorators', [
  'EntityDecorator', 'Random', 'Screen', 'DecoratorUtil as util',
  'SharedComputation as c']);

UtilityDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'utility');
};

UtilityDecorators.prototype.decorateDruid_ = function(obj, spec) {
  switch(spec.power) {
  case 3:
    this.decoratSplit_(obj, spec);
    break;
  case 2:
    this.decoratRage_(obj, spec);
    break;
  case 1:
    this.decoratMink_(obj, spec);
  }
};

UtilityDecorators.prototype.decorateMink_ = function(obj, spec) {
  _.spec(obj, 'utility', spec, {
    radius: .7,
    speed: 1.3
  });

  this.util_.mod(obj, 'speed', obj.utility.speed);
  this.util_.mod(obj, 'radius', obj.utility.radius);
};

UtilityDecorators.prototype.decorateRage_ = function(obj, spec) {
  _.spec(obj, 'utility', spec, {
    radius: 1.5,
    dmg: 1.5,
    enrageHealth: .5
  });

  obj.resolve(function() {
    var enrage = obj.maxHealth * obj.utility.enrageHealth;
    if (obj.health <= enrage && obj.prevHealth > enrage) {
      obj.radius *= obj.utility.radius;
      if (obj.primary) obj.primary.dmg *= obj.utility.dmg;
      if (obj.secondary) obj.secondary.dmg *= obj.utility.dmg;
      return;
    }

    if (obj.health > enrage && obj.prevHealth <= enrage) {
      this.util_.mod(obj, 'radius', 1 / obj.utility.radius);
      this.util_.mod(obj, 'primary.dmg', 1 / obj.utility.dmg);
      this.util_.mod(obj, 'secondary.dmg', 1 / obj.utility.dmg);
      return;
    }
  }.bind(this));
};

UtilityDecorators.prototype.decorateSplit_ = function(obj, spec) {
  _.spec(obj, 'utility', spec, {
    cooldown: 6
  });

  obj.resolve(function(dt) {
    if (obj.health < obj.prevHealth) split.call(this, dt);
  }.bind(this));

  function split(dt) {
    var newDna = [];
    for (var i = 0; i < obj.dna.length; i++) {
      var item = obj.dna[i];
      if (item.id == 'utility.split') continue;
      if (item.id == 'shape.circle') item.spec.radius *= .85;
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

    this.util_.mod(s1, 'primary.dmg', .5);
    this.util_.mod(s1, 'secondary.dmg', .5);
    this.util_.mod(s1, 'ability.dmg', .5);
    this.util_.mod(s1, 'utility.dmg', .5);
    s1.setMaxHealth(obj.prevHealth / 2);
    s2.setMaxHealth(obj.prevHealth / 2);

    obj.dead = obj.remove = true;
    obj.clones = [s1, s2];
    s1.clones = [s2];
    s2.clones = [s1];

    s1.act(dt);
    s2.act(dt);
  };
};

UtilityDecorators.prototype.decorateTank_ = function(obj, spec) {
  _.spec(obj, 'utility', spec, {
    def: 1
  });

  switch(spec.power) {
  case 2:
    obj.collision.dmg = 0;
  case 1:
    this.util_.mod(obj, 'def', spec.def);
  }
};

UtilityDecorators.prototype.decorateRanger_ = function(obj, spec) {
  _.spec(obj, 'utility', spec, {
    range: 1
  });

  switch(spec.power) {
  case 3:
    // TODO: Warp accross map ability.
  case 2:
    this.util_.mod(obj, 'primary.accuracy', 0);
    this.util_.mod(obj, 'secondary.accuracy', 0);
  case 1:
    this.util_.mod(obj, 'primary.range', spec.range);
    this.util_.mod(obj, 'secondary.range', spec.range);
  }
};

UtilityDecorators.prototype.decorateNinja_ = function(obj, spec) {
  _.spec(obj, 'utility', spec, {
    speed: 1
  });

  switch(spec.power) {
  case 3:
    this.decoratInvisible_(obj, spec);
    break;
  case 2:
    this.decoratTeleport_(obj, spec);
    break;
  case 1:
    this.decoratDash_(obj, spec);
  }
  this.util_.mod(obj, 'movement.speed', spec.speed);
};

UtilityDecorators.prototype.decorateDash_ = function(obj, spec) {
  _.spec(obj, 'utility', spec, {
    cooldown: 1.5,
    duration: .1,
    accel: .05,
    speed: 4.5
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
    obj.movement.speed *= obj.utility.speed;
  };

  obj.utility.stopDash = function() {
    obj.movement.vector = {x: 0, y: 0};
    obj.movement.accel /= obj.utility.accel;
    obj.movement.speed /= obj.utility.speed;
    if (!PROD) _.assert(_.isDef(obj.effect.dash));
    obj.effect.dash = 0;
  };
};

UtilityDecorators.prototype.decorateTeleport_ = function(obj, spec) {
  _.spec(obj, 'utility', spec, {
    cooldown: 2,
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
  };
};

UtilityDecorators.prototype.decorateInvisible_ = function(obj, spec) {
  _.spec(obj, 'utility', spec, {
    cooldown: 6,
    effect: 'invisible',
    duration: 2,
    targetless: true
  });

  obj.resolve(function() {
    if (obj.effect.invisible &&
        obj.health < obj.prevHealth &&
        obj.utility.duration - obj.effect.invisible > .5) {
      obj.effect.invisible = 0;
    }
  });

  this.util_.addEffectAbility(obj, obj.utility);
};
