var SecondaryDecorator = di.service('SecondaryDecorator', [
  'EntityDecorator', 'DecoratorUtil as util', 'GameModel as gm',
  'ItemService', 'Random']);


SecondaryDecorator.prototype.init = function() {
  this.d_ = this.entityDecorator_.getDecorators();
  this.entityDecorator_.addDecoratorObj(this, 'secondary');
};

SecondaryDecorator.prototype.decoratePistol_ = function(obj, spec) {
  this.util_.spec(obj, 'secondary', spec, {
    length: 6 + 16,
    speed: Speed.DEFAULT,
    style: 'weak',
    maxTargetAngle: MaxTargetAngle.DEFAULT
  });

  switch(spec.power) {
  case 2:
    obj.secondary.cooldown *= .75;
  case 1:
    obj.secondary.dmg *= 1.5;
  }

  this.util_.addBasicWeapon_(obj, obj.secondary, this.util_.proj.laser);
};

SecondaryDecorator.prototype.decorateStun_ = function(obj, spec) {
  this.util_.spec(obj, 'secondary', spec, {
    length: 4 + 16,
    speed: Speed.DEFAULT,
    duration: 1,
    style: 'effect',
    effect: 'stunned disabled',
    maxTargetAngle: MaxTargetAngle.DEFAULT
  });

  switch(spec.power) {
  case 1:
    obj.secondary.duration *= 1.4;
  }

  var stopMovement = function(target) {
    target.movement.vector = {x: 0, y: 0};
  };
  this.util_.addBasicWeapon_(obj, obj.secondary,
                             this.util_.proj.laser, stopMovement);
};

SecondaryDecorator.prototype.decorateEmp_ = function(obj, spec) {
  this.util_.spec(obj, 'secondary', spec, {
    radius: 15,
    speed: Speed.SLOW,
    duration: 1.2,
    style: 'effect',
    effect: 'stunned disabled',
    maxTargetAngle: MaxTargetAngle.DEFAULT
  });

  switch(spec.power) {
  case 1:
    obj.secondary.duration *= 1.3;
    obj.secondary.radius *= 1.1;
  }

  this.util_.addBasicWeapon_(obj, obj.secondary, this.util_.proj.bomb);
};

SecondaryDecorator.prototype.decorateCharge_ = function(obj, spec) {
  this.util_.spec(obj, 'secondary', spec, {
    minRange: 100,
    speed: 300,
    duration: 1.2,
    range: 200,
    cooldown: 4,
    stunReduction: 2,
    def: 1,
    maxTargetAngle: MaxTargetAngle.DEFAULT
  });

  switch(spec.power) {
  case 1:
    obj.secondary.def = 1.5;
  }

  var collisionRatio = .1;
  var stopCharge = function() {
    if (!obj.secondary.charging) return;
    obj.secondary.charging = false;
    this.util_.modSet(obj, 'movement.speed', null);
    obj.collision.dmg /= collisionRatio;
    obj.collision.stunDuration /= obj.secondary.stunReduction;
    obj.def /= obj.secondary.def;
  }.bind(this);

  this.util_.addWeapon(obj, obj.secondary, function() {
    obj.addEffect('displaced', duration, stopCharge);
    obj.addEffect('stunned', duration, stopCharge);
    this.util_.modSet(obj, 'movement.speed', obj.secondary.speed);

    obj.movement.vector.x = Math.cos(obj.c.targetAngle);
    obj.movement.vector.y = Math.sin(obj.c.targetAngle);

    obj.collision.dmg *= collisionRatio;
    obj.collision.stunDuration /= obj.secondary.stunReduction;
    var duration = obj.secondary.range * 1.2 / obj.movement.speed;
    obj.secondary.charging = true;
    obj.def *= obj.secondary.def;
  }.bind(this));
};

SecondaryDecorator.prototype.decorateTracker_ = function(obj, spec) {
  this.util_.spec(obj, 'secondary', spec, {
    speed: Speed.DEFAULT,
    cooldown: 3,
    length: 4 + 16,
    duration: 1000,
    style: 'effect',
    effect: 'tagged',
    seekAdd: _.radians(50),
    dmgRatio: 1,
    range: 300,
    maxTargetAngle: MaxTargetAngle.DEFAULT
  });

  switch(spec.power) {
  case 1:
    obj.secondary.dmgRatio += .25;
  }

  this.util_.addBasicWeapon_(obj, obj.secondary, this.util_.proj.laser);

  obj.prefire(function(proj) {
    if (proj.spec.name != 'primary') return;

    var usingTag = false;
    proj.act(function() {
      if (usingTag == !!proj.target.effect.tagged) return;
      usingTag = !!proj.target.effect.tagged;
      var dir = proj.target.effect.tagged ? 1 : -1;  // Tag or untag.
      this.util_.modAdd(proj, 'movement.seek', obj.secondary.seekAdd * dir);
    }, this);

    proj.collide(function(target) {
      if (!target.effect.tagged) return;
      target.effect.tagged = 0;
      this.util_.mod(proj, 'dmg', obj.secondary.dmgRatio);
    }, this);
  }, this);
};

SecondaryDecorator.prototype.decoratePull_ = function(obj, spec) {
  this.util_.spec(obj, 'secondary', spec, {
    duration: null,
    range: null,
    knockbackDuration: .5,
    cooldown: 4,
    knockback: 45,
    grow: -500,
    radius: spec.range
  });

  switch(spec.power) {
  case 1:
    obj.secondary.duration *= 1.3;
  }

  var knockback = function(target) {
    target.addEffect('displaced', obj.secondary.knockbackDuration, function() {
      this.util_.modSet(target, 'movement.speed', null);
      target.movement.vector = {x: 0, y: 0};
    }.bind(this));
    target.movement.vector.x = -Math.cos(obj.c.targetAngle);
    target.movement.vector.y = -Math.sin(obj.c.targetAngle);
    var speed = obj.secondary.knockback / obj.secondary.knockbackDuration;
    target.addEffect('stunned', obj.secondary.duration);
    this.util_.modSet(target, 'movement.speed', speed);
  }.bind(this);

  this.util_.addWeapon(obj, obj.secondary, function() {
    this.util_.fireAura(obj, obj.secondary);
    for (var i = 0; i < obj.target.clones.length; i++) {
      var clone = obj.target.clones[i];
      if (!clone.dead && _.distance(obj, clone) <= obj.secondary.range) {
        knockback(clone);
      }
    }
  }.bind(this));
};

SecondaryDecorator.prototype.decorateTurret_ = function(obj, spec) {
  this.util_.spec(obj, 'secondary', spec, {
    dmgRatio: .15,
    targetless: true
  });

  this.util_.addWeapon(obj, obj.secondary, function() {
    var dna = [this.itemService_.getByName('basic laser'),
               this.itemService_.getByName('brown')];
    var turret = obj.addClone(dna);
    this.util_.mod(turret, 'radius', .70);
    this.util_.mod(turret, 'primary.dmg', obj.secondary.dmgRatio);
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
  this.util_.spec(obj, 'secondary', spec, {
    dmgRatio: .15,
    targetless: true
  });

  this.util_.addWeapon(obj, obj.secondary, function() {
    var dna = [this.itemService_.getByName('alien laser'),
               this.itemService_.getByName('alien1')];
    var spawn = obj.addClone(dna);
    this.util_.mod(spawn, 'radius', .70);
    this.util_.mod(spawn, 'primary.dmg', obj.secondary.dmgRatio);
    this.util_.mod(spawn, 'collision.dmg', .5);
    spawn.setMaxHealth(8);

    var angle = obj.c.targetAngle + this.random_.nextSign() * _.RADIANS_135;
    spawn.x = obj.x + Math.cos(angle) * 30;
    spawn.y = obj.y + Math.sin(angle) * 30;

    spawn.act(Game.UPDATE_RATE);
  }.bind(this));
};
