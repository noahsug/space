var UtilityDecorators = di.service('UtilityDecorators', [
  'EntityDecorator', 'Random', 'Screen', 'DecoratorUtil as util']);

UtilityDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'utility');
};

UtilityDecorators.prototype.decorateDash_ = function(obj, spec) {
  obj.utility = _.options(spec, {
    cooldown: 2,
    duration: .1,
    accel: .1,
    speed: 400
  });

  obj.utility.dash = 0;

  obj.awake(function() {
    obj.utility.accel = obj.utility.accel / obj.movement.accel;
    obj.utility.speed = obj.utility.speed / obj.movement.speed;
  });

  this.util_.onCooldown(obj, function() {
    if (obj.utility.useDash && obj.utility.dashReady) {
      useDash();
      obj.utility.dashReady = false;
      return obj.utility.cooldown;
    }
    obj.utility.dashReady = true;
    return 0;
  });

  obj.act(function(dt) {
    if (obj.utility.dash > 0) {
      obj.utility.useDash = false;
      obj.utility.dash -= dt;
      if (obj.utility.dash <= 0) {
        obj.utility.stopDash();
      }
    }
    return obj.utility.dash;
  });

  function useDash() {
    obj.movement.vector = obj.movement.desiredVector;
    obj.movement.accel *= obj.utility.accel;
    obj.movement.speed *= obj.utility.speed;
    obj.utility.dash = obj.utility.duration;
  }

  obj.utility.stopDash = function() {
    obj.movement.accel /= obj.utility.accel;
    obj.movement.speed /= obj.utility.speed;
    obj.utility.dash = 0;
  };
};

UtilityDecorators.prototype.decorateTeleport_ = function(obj, spec) {
  spec = _.options(spec, {
    cooldown: 0,
    distance: 50
  });

  obj.teleport = {
    ready: false,
    use: false
  };

  var cooldown = spec.cooldown;
  obj.act(function(dt) {
    if (obj.effects.stunned.value) return;
    cooldown -= dt;
    obj.teleport.ready = cooldown <= 0;
  });

  obj.resolve(function() {
    if (obj.teleport.use) {
      teleport();
      obj.teleport.ready = false;
      obj.teleport.use = false;
      cooldown = spec.cooldown;
    }
  });

  var teleport = function() {
    var dx = obj.x - this.screen_.x;
    var dXWall = this.screen_.width / 2 - Math.abs(dx) - obj.radius;
    var xDirection;
    if (dXWall < spec.distance) {
      xDirection = dx > 0 ? -1 : 1;
    } else {
      xDirection = this.random_.flipCoin() ? 1 : -1;
    }

    var dy = obj.y - this.screen_.y;
    var dYWall = this.screen_.width / 2 - Math.abs(dy);
    var yDirection;
    if (dYWall < spec.distance) {
      yDirection = dy > 0 ? -1 : 1;
    } else {
      yDirection = this.random_.flipCoin() ? 1 : -1;
    }

    obj.x += spec.distance * xDirection;
    obj.y += spec.distance * yDirection;
  }.bind(this);
};
