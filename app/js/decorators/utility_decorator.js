var UtilityDecorators = di.service('UtilityDecorators', [
  'EntityDecorator', 'Random', 'Screen', 'DecoratorUtil as util',
  'SharedComputation as c']);

UtilityDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'utility');
};

UtilityDecorators.prototype.decorateDash_ = function(obj, spec) {
  obj.utility = _.options(spec, {
    cooldown: 2,
    duration: .1,
    accel: .05,
    speed: 4
  });

  obj.addEffect('dashCooldown', obj.utility.cooldown, function() {
    obj.utility.dashReady = true;
  });

  obj.utility.useDash = function() {
    obj.addEffect('dash', obj.utility.duration, obj.utility.stopDash);
    obj.utility.dashReady = false;
    obj.effect.dashCooldown = obj.utility.cooldown;
    obj.movement.vector = obj.movement.desiredVector;
    obj.movement.accel *= obj.utility.accel;
    obj.movement.speed *= obj.utility.speed;
  };

  obj.utility.stopDash = function() {
    obj.movement.accel /= obj.utility.accel;
    obj.movement.speed /= obj.utility.speed;
    obj.effect.dash = 0;
  };
};

UtilityDecorators.prototype.decorateTurbo_ = function(obj, spec) {
  obj.utility = _.options(spec, {
    speed: 1.25
  });
  this.util_.mod(obj, 'movement.speed', obj.utility.speed);
};

UtilityDecorators.prototype.decorateTeleport_ = function(obj, spec) {
  obj.utility = _.options(spec, {
    cooldown: 2,
    range: 400,
    distance: 20,
    disabledDuration: .1
  });

  obj.addEffect('teleportCooldown', obj.utility.cooldown);
  obj.act(function(dt) {
    obj.utility.teleportReady =
        !obj.effect.teleportCooldown && obj.c.targetDis <= obj.utility.range;
    if (!obj.utility.teleportReady) return;
    obj.utility.teleportPos = {
      x: obj.target.x + Math.cos(obj.c.targetAngle) * 60,
      y: obj.target.y + Math.sin(obj.c.targetAngle) * 60
    };
    obj.utility.teleportReady = !this.c_.hitWall(obj.utility.teleportPos);
  }.bind(this));

  obj.utility.useTeleport = function() {
    obj.effect.teleportCooldown = obj.utility.cooldown;
    obj.addEffect('disabled', obj.utility.disabledDuration);
    obj.movement.vector = {x: 0, y: 0};
    obj.x = obj.utility.teleportPos.x;
    obj.y = obj.utility.teleportPos.y;
  };
};

UtilityDecorators.prototype.decorateMink_ = function(obj) {
  var spec = {
    radius: .8,
    speed: 1.25,
    dmg: .8
  };

  this.util_.mod(obj, 'radius', spec.radius);
  this.util_.mod(obj, 'speed', spec.speed);
  this.util_.mod(obj, 'primary.dmg', spec.dmg);
  this.util_.mod(obj, 'secondary.dmg', spec.dmg);
};

UtilityDecorators.prototype.decorateRage_ = function(obj) {
  var spec = {
    radius: 1.5,
    dmg: 1.5,
    enrageHealth: .5
  };

  obj.resolve(function() {
    var enrage = obj.maxHealth * spec.enrageHealth;
    if (obj.health <= enrage && obj.prevHealth > enrage) {
      obj.radius *= spec.radius;
      if (obj.primary) obj.primary.dmg *= spec.dmg;
      if (obj.secondary) obj.secondary.dmg *= spec.dmg;
      return;
    }

    if (obj.health > enrage && obj.prevHealth <= enrage) {
      this.util_.mod(obj, 'radius', 1 / spec.radius);
      this.util_.mod(obj, 'primary.dmg', 1 / spec.dmg);
      this.util_.mod(obj, 'secondary.dmg', 1 / spec.dmg);
      return;
    }
  }.bind(this));
};
