var SecondaryDecorators = di.service('SecondaryDecorators', [
  'EntityDecorator', 'DecoratorUtil as util', 'GameModel as gm']);


SecondaryDecorators.prototype.init = function() {
  this.d_ = this.entityDecorator_.getDecorators();
  this.entityDecorator_.addDecoratorObj(this, 'secondary');
};

SecondaryDecorators.prototype.decoratePistol_ = function(obj, spec) {
  _.spec(obj, 'secondary', spec, {
    dmg: 3,
    speed: 300,
    accuracy: _.radians(10),
    cooldown: 1.25,
    length: 6 + 16,
    range: 300
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
  _.spec(obj, 'secondary', spec, {
    dmg: 1,
    speed: 300,
    accuracy: _.radians(10),
    cooldown: 1.5,
    length: 4 + 16,
    duration: 1,
    style: 'effect',
    effect: 'stunned disabled',
    range: 150
  });

  switch(spec.power) {
  case 1:
    obj.secondary.duration *= 1.3;
  }

  var stopMovement = function(obj) {
    obj.target.movement.vector = {x: 0, y: 0};
  };
  this.util_.addEffectWeapon_(obj, obj.secondary,
                              this.util_.fireLaser.bind(this.util_),
                              stopMovement);
};

SecondaryDecorators.prototype.decorateEmp_ = function(obj, spec) {
  _.spec(obj, 'secondary', spec, {
    dmg: 1,
    speed: 200,
    accuracy: _.radians(10),
    cooldown: 1.5,
    radius: 15,
    duration: 1.2,
    style: 'effect',
    effect: 'stunned disabled',
    range: 150
  });

  switch(spec.power) {
  case 1:
    obj.secondary.duration *= 1.3;
    obj.secondary.radius *= 1.3;
  }

  this.util_.addEffectWeapon_(obj,
                              obj.secondary,
                              this.util_.fireBomb.bind(this.util_));
};

SecondaryDecorators.prototype.decorateCharge_ = function(obj, spec) {
  _.spec(obj, 'secondary', spec, {
    speed: 400,
    accuracy: _.radians(10),
    range: 200,
    minRange: 100,
    cooldown: 4,
    stunReduction: 2
  });

  switch(spec.power) {
  case 1:
    obj.secondary.speed *= 1.3;
    obj.secondary.cooldown *= .8;
  }

  var ratio = obj.secondary.speed / (obj.movement.speed || 1);
  this.util_.addWeapon(obj, obj.secondary, function() {
    obj.movement.vector.x = Math.cos(obj.c.targetAngle);
    obj.movement.vector.y = Math.sin(obj.c.targetAngle);
    obj.movement.speed *= ratio;
    var collisionRatio = .00001;
    obj.collision.dmg *= collisionRatio;
    obj.collision.stunDuration /= obj.movement.stunReduction;
    var duration = obj.secondary.range * 1.2 / obj.movement.speed;
    obj.secondary.charging = true;

    obj.addEffect('stunned', duration, function() {
      obj.secondary.charging = false;
      obj.movement.speed /= ratio;
      obj.collision.dmg /= collisionRatio;
      obj.collision.stunDuration /= obj.movement.stunReduction;
    });
  });
};

SecondaryDecorators.prototype.decorateTracker_ = function(obj, spec) {
  _.spec(obj, 'secondary', spec, {
    dmg: 1,
    speed: 300,
    accuracy: _.radians(10),
    cooldown: 1.5,
    length: 4 + 16,
    duration: 1000,
    style: 'effect',
    effect: 'tagged',
    taggedSeek: _.radians(70),
    range: 300
  });

  switch(spec.power) {
  case 1:
    obj.secondary.taggedSeek *= 1.3;
  }

  this.util_.addEffectWeapon_(obj,
                              obj.secondary,
                              this.util_.fireLaser.bind(this.util_));

  obj.maybeTrackTarget = function(projectile, spec) {
    if (projectile.target.effect.tagged && spec.name == 'primary') {
      projectile.target.effect.tagged = 0;
      this.util_.set(projectile, 'movement.seek', obj.secondary.taggedSeek);
    }
  }.bind(this);
};
