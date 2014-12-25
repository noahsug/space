var UtilityDecorators = di.service('UtilityDecorators', [
  'EntityDecorator', 'Random', 'Screen']);

UtilityDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'utility');
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
