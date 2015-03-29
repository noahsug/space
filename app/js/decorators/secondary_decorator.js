var SecondaryDecorators = di.service('SecondaryDecorators', [
  'EntityDecorator', 'DecoratorUtil as util', 'GameModel as gm']);


SecondaryDecorators.prototype.init = function() {
  this.d_ = this.entityDecorator_.getDecorators();
  this.entityDecorator_.addDecoratorObj(this, 'secondary');
};

SecondaryDecorators.prototype.decoratePistol_ = function(obj, spec) {
  this.util_.spec(obj, 'secondary', spec, {
    length: 6 + 16,
    speed: Speed.DEFAULT
  });

  switch(spec.power) {
  case 2:
    obj.secondary.cooldown *= .75;
  case 1:
    obj.secondary.dmg *= 1.5;
  }

  this.util_.addWeapon(obj, obj.secondary, function() {
    var projectile = this.util_.fireLaser(obj, obj.secondary);
    _.decorate(projectile, this.d_.dmgCollision, obj.secondary);
  }.bind(this));
};

SecondaryDecorators.prototype.decorateStun_ = function(obj, spec) {
  this.util_.spec(obj, 'secondary', spec, {
    length: 4 + 16,
    speed: Speed.DEFAULT,
    duration: 1,
    style: 'effect',
    effect: 'stunned disabled'
  });

  switch(spec.power) {
  case 1:
    obj.secondary.duration *= 1.4;
  }

  var stopMovement = function(obj) {
    obj.target.movement.vector = {x: 0, y: 0};
  };
  this.util_.addEffectWeapon_(obj, obj.secondary,
                              this.util_.fireLaser.bind(this.util_),
                              stopMovement);
};

SecondaryDecorators.prototype.decorateEmp_ = function(obj, spec) {
  this.util_.spec(obj, 'secondary', spec, {
    radius: 15,
    speed: Speed.SLOW,
    duration: 1.2,
    style: 'effect',
    effect: 'stunned disabled'
  });

  switch(spec.power) {
  case 1:
    obj.secondary.duration *= 1.3;
    obj.secondary.radius *= 1.1;
  }

  this.util_.addEffectWeapon_(obj,
                              obj.secondary,
                              this.util_.fireBomb.bind(this.util_));
};

SecondaryDecorators.prototype.decorateCharge_ = function(obj, spec) {
  this.util_.spec(obj, 'secondary', spec, {
    minRange: 100,
    speed: 500,
    duration: 1.2,
    range: 200,
    cooldown: 4,
    stunReduction: 2,
    def: 1
  });

  switch(spec.power) {
  case 1:
    obj.secondary.def = 1.5;
  }

  var ratio = obj.secondary.speed / (obj.movement.speed || 1);
  this.util_.addWeapon(obj, obj.secondary, function() {
    obj.movement.vector.x = Math.cos(obj.c.targetAngle);
    obj.movement.vector.y = Math.sin(obj.c.targetAngle);
    obj.movement.speed *= ratio;
    var collisionRatio = .00001;
    obj.collision.dmg *= collisionRatio;
    obj.collision.stunDuration /= obj.secondary.stunReduction;
    var duration = obj.secondary.range * 1.2 / obj.movement.speed;
    obj.secondary.charging = true;
    obj.def *= obj.secondary.def;

    obj.secondary.stopCharge = function() {
      obj.secondary.charging = false;
      obj.movement.speed /= ratio;
      obj.collision.dmg /= collisionRatio;
      obj.collision.stunDuration /= obj.secondary.stunReduction;
      obj.def /= obj.secondary.def;
    };

    obj.addEffect('stunned', duration, obj.secondary.stopCharge);
  });
};

SecondaryDecorators.prototype.decorateTracker_ = function(obj, spec) {
  this.util_.spec(obj, 'secondary', spec, {
    dmg: 1,
    speed: Speed.DEFAULT,
    cooldown: 3,
    length: 4 + 16,
    duration: 1000,
    style: 'effect',
    effect: 'tagged',
    seekMod: _.radians(360),
    dmgMod: 1.25,
    range: 300
  });

  switch(spec.power) {
  case 1:
    obj.secondary.dmgMod += .25;
  }

  this.util_.addEffectWeapon_(obj,
                              obj.secondary,
                              this.util_.fireLaser.bind(this.util_));

  obj.maybeTrackTarget = function(projectile, spec) {
    if (projectile.target.effect.tagged && spec.name == 'primary') {
      projectile.target.effect.tagged = 0;
      this.util_.set(projectile, 'movement.seek', obj.secondary.seekMod);
      this.util_.mod(projectile, 'dmg', obj.secondary.dmgMod);
    }
  }.bind(this);
};
