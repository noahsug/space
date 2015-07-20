var SecondaryDecorator = di.service('SecondaryDecorator', [
  'EntityDecorator', 'DecoratorUtil as util', 'GameModel as gm',
  'ItemService', 'Random']);


SecondaryDecorator.prototype.init = function() {
  this.d_ = this.entityDecorator_.getDecorators();
  this.entityDecorator_.addDecoratorObj(this, 'secondary');
  this.specName_ = 'secondary';
};

SecondaryDecorator.prototype.decoratePistol_ = function(obj, spec) {
  spec = this.util_.spec(obj, this.specName_, spec, {
    length: 6 + 16,
    speed: g.Speed.DEFAULT,
    style: 'weak',
    maxTargetAngle: g.MaxTargetAngle.DEFAULT,
    firesDodgableProj: true
  });

  this.util_.addBasicWeapon_(obj, spec, this.util_.proj.laser);
};

SecondaryDecorator.prototype.decorateStun_ = function(obj, spec) {
  spec = this.util_.spec(obj, this.specName_, spec, {
    length: 4 + 16,
    speed: g.Speed.DEFAULT,
    duration: 1,
    style: 'effect',
    effect: 'silenced rooted disabled',
    maxTargetAngle: g.MaxTargetAngle.DEFAULT,
    firesDodgableProj: true
  });

  var stopMovement = function(target) {
    target.movement.vector = {x: 0, y: 0};
  };
  this.util_.addBasicWeapon_(obj, spec,
                             this.util_.proj.laser, stopMovement);
};

SecondaryDecorator.prototype.decorateEmp_ = function(obj, spec) {
  spec = this.util_.spec(obj, this.specName_, spec, {
    radius: 15,
    speed: g.Speed.SLOW,
    duration: 1.2,
    style: 'effect',
    effect: 'silenced rooted disabled',
    maxTargetAngle: g.MaxTargetAngle.DEFAULT,
    firesDodgableProj: true
  });

  this.util_.addBasicWeapon_(obj, spec, this.util_.proj.bomb);
};

SecondaryDecorator.prototype.decorateCharge_ = function(obj, spec) {
  spec = this.util_.spec(obj, this.specName_, spec, {
    dmg: 0,
    cooldown: 0,
    range: 200,
    speed: 300,
    stunReduction: 2,
    def: 1,
    accelReduction: 3,
    maxTargetAngle: g.MaxTargetAngle.DEFAULT,
    firesDodgableProj: true
  });

  var collisionRatio = .1;
  var stopEffects;
  var stopCharge = function() {
    if (!spec.charging) return;
    spec.charging = false;
    stopEffects();
    this.util_.modSet(obj, 'movement.speed', null);
    this.util_.mod(obj, 'movement.accel', spec.accelReduction);
    this.util_.mod(obj, 'turnSpeed', spec.accelReduction);
    obj.collision.dmg /= collisionRatio;
    obj.collision.stunDuration /= spec.stunReduction;
    obj.def /= spec.def;
  }.bind(this);

  spec.isJammed = function() { return spec.charging; };

  this.util_.addWeapon(obj, spec, function() {
    var duration = spec.range / spec.speed;
    obj.addEffect('displaced', duration, stopCharge);
    stopEffects = obj.stopEffectsFn(['displaced']);
    this.util_.modSet(obj, 'movement.speed', spec.speed);
    this.util_.mod(obj, 'movement.accel', 1/spec.accelReduction);
    this.util_.mod(obj, 'turnSpeed', 1/spec.accelReduction);

    obj.movement.vector.x = Math.cos(obj.c.targetAngle);
    obj.movement.vector.y = Math.sin(obj.c.targetAngle);

    obj.collision.dmg *= collisionRatio;
    obj.collision.stunDuration /= spec.stunReduction;
    spec.charging = true;
    obj.def *= spec.def;
  }.bind(this));

  obj.receivedCollide(function(proj) {
    if (!proj.spec || proj.spec.name != 'primary') return;
    if (proj.spec.projectiles > 1) return;
    stopCharge();
  });
};

SecondaryDecorator.prototype.decorateTracker_ = function(obj, spec) {
  spec = this.util_.spec(obj, this.specName_, spec, {
    speed: g.Speed.DEFAULT,
    cooldown: 3,
    length: 4 + 16,
    duration: 1000,
    style: 'effect',
    effect: 'tagged',
    seekAdd: _.radians(50),
    dmgRatio: 1,
    range: 300,
    maxTargetAngle: g.MaxTargetAngle.DEFAULT,
    firesDodgableProj: true
  });

  switch(spec.power) {
  case 1:
    spec.dmgRatio += .25;
  }

  this.util_.addBasicWeapon_(obj, spec, this.util_.proj.laser);

  obj.prefire(function(proj) {
    if (proj.spec.name != 'primary') return;

    var usingTag = false;
    proj.act(function() {
      if (usingTag == !!proj.target.effect.tagged) return;
      usingTag = !!proj.target.effect.tagged;
      var dir = proj.target.effect.tagged ? 1 : -1;  // Tag or untag.
      this.util_.modAdd(proj, 'movement.seek', spec.seekAdd * dir);
    }, this);

    proj.collide(function(target) {
      if (!target.effect.tagged) return;
      target.effect.tagged = 0;
      this.util_.mod(proj, 'dmg', spec.dmgRatio);
    }, this);
  }, this);
};

SecondaryDecorator.prototype.decoratePull_ = function(obj, spec) {
  spec = this.util_.spec(obj, this.specName_, spec, {
    duration: null,
    range: null,
    knockbackDuration: .5,
    cooldown: 4,
    knockback: 45,
    grow: -500,
    radius: spec.range
  });
  spec.maxRange = spec.range;

  switch(spec.power) {
  case 1:
    spec.duration *= 1.3;
  }

  var knockback = function(target) {
    target.addEffect('displaced', spec.knockbackDuration, function() {
      this.util_.modSet(target, 'movement.speed', null);
      target.movement.vector = {x: 0, y: 0};
    }.bind(this));
    target.movement.vector.x = -Math.cos(obj.c.targetAngle);
    target.movement.vector.y = -Math.sin(obj.c.targetAngle);
    var speed = spec.knockback / spec.knockbackDuration;
    target.addEffect('silenced rooted disabled', spec.duration);
    this.util_.modSet(target, 'movement.speed', speed);
  }.bind(this);

  this.util_.addWeapon(obj, spec, function() {
    this.util_.fireAura(obj, spec);
    for (var i = 0; i < obj.target.clones.length; i++) {
      var clone = obj.target.clones[i];
      if (!clone.dead && _.distance(obj, clone) <= spec.range) {
        knockback(clone);
      }
    }
  }.bind(this));
};

SecondaryDecorator.prototype.decorateTurret_ = function(obj, spec) {
  spec = this.util_.spec(obj, this.specName_, spec, {
    dmgRatio: .15,
    targetless: true
  });

  this.util_.addWeapon(obj, spec, function() {
    var dna = [this.itemService_.getByName('basic laser'),
               this.itemService_.getByName('brown')];
    var turret = obj.addClone(dna);
    this.util_.mod(turret, 'radius', .70);
    this.util_.mod(turret, 'primary.dmg', spec.dmgRatio);
    this.util_.mod(turret, 'collision.dmg', .5);
    // Needed for the turret to get knocked arounded.
    turret.movement.speed = 50;
    turret.movement.turret = true;
    turret.setMaxHealth(8);

    var angle = obj.c.targetAngle + this.random_.nextSign() * _.RADIANS_135;
    turret.x = obj.x + Math.cos(angle) * 30;
    turret.y = obj.y + Math.sin(angle) * 30;

    turret.act(Game.UPDATE_RATE);
  }.bind(this));
};

SecondaryDecorator.prototype.decorateSpawn_ = function(obj, spec) {
  spec = this.util_.spec(obj, this.specName_, spec, {
    dmgRatio: .15,
    targetless: true
  });

  this.util_.addWeapon(obj, spec, function() {
    var dna = [this.itemService_.getByName('alien laser'),
               this.itemService_.getByName('alien1')];
    var spawn = obj.addClone(dna);
    this.util_.mod(spawn, 'radius', .70);
    this.util_.mod(spawn, 'primary.dmg', spec.dmgRatio);
    this.util_.mod(spawn, 'collision.dmg', .5);
    spawn.setMaxHealth(8);

    var angle = obj.c.targetAngle + this.random_.nextSign() * _.RADIANS_135;
    spawn.x = obj.x + Math.cos(angle) * 30;
    spawn.y = obj.y + Math.sin(angle) * 30;

    spawn.act(Game.UPDATE_RATE);
  }.bind(this));
};

SecondaryDecorator.prototype.decorateKnockback_ = function(obj, spec) {
  spec = this.util_.spec(obj, this.specName_, spec, {
    speed: 300,
    cooldown: 4,
    duration: .75,
    grow: 500,
    maxRadius: 100,
    range: 100
  });
  // Increase range slightly so player has a chance of using ability before AI.
  spec.actualRange = spec.range * 1.2;
  spec.maxRange = spec.actualRange;

  spec.isJammed = function() {
    return this.util_.getNearbyClones(obj, spec.actualRange).length == 0;
  }.bind(this);

  var knockback = function(target) {
    target.addEffect('silenced rooted', spec.duration);
    target.addEffect('displaced', spec.duration, function() {
      this.util_.modSet(target, 'movement.speed', null);
    }.bind(this));

    target.movement.vector.x = Math.cos(obj.c.targetAngle);
    target.movement.vector.y = Math.sin(obj.c.targetAngle);
    this.util_.modSet(target, 'movement.speed', spec.speed);
  }.bind(this);

  this.util_.addWeapon(obj, spec, function() {
    this.util_.fireAura(obj, spec);
    this.util_.getNearbyClones(obj, spec.actualRange).forEach(function(clone) {
      knockback(clone);
    });
  }.bind(this));
};
