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
    speed: 4
  });

  obj.utility.dash = 0;

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
