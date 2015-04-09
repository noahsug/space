var ActiveDecorator = di.service('ActiveDecorator', [
  'EntityDecorator', 'DecoratorUtil as util', 'Mouse',
  'SharedComputation as c']);

ActiveDecorator.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'active');
};

ActiveDecorator.prototype.decorateFreeze_ = function(obj, spec) {
  this.util_.spec(obj, 'active', spec, {
    duration: 2
  });

  this.onClick_(obj, function() {
    obj.target.addEffect('stunned', obj.active.duration);
    obj.target.movement.vector = {x: 0, y: 0};
  }, this);
};

ActiveDecorator.prototype.decorateWarp_ = function(obj, spec) {
  this.onClick_(obj, function() {
    // Try to teleport behind the enemy.
    obj.active.teleportPos = {
      x: obj.target.x + Math.cos(obj.c.targetAngle) * 60,
      y: obj.target.y + Math.sin(obj.c.targetAngle) * 60
    };
    if (this.c_.hitWall(obj.active.teleportPos)) {
      // Hit a wall, teleport in front of the enemy instead.
      obj.active.teleportPos = {
        x: obj.target.x - Math.cos(obj.c.targetAngle) * 60,
        y: obj.target.y - Math.sin(obj.c.targetAngle) * 60
      };
    }

    obj.movement.vector = {x: 0, y: 0};
    obj.x = obj.active.teleportPos.x;
    obj.y = obj.active.teleportPos.y;
  }, this);
};

ActiveDecorator.prototype.onClick_ = function(obj, fn, opt_context) {
  obj.update(function() {
    if (obj.active.used) return;
    if (this.mouse_.pressed) {
      fn.call(opt_context);
      obj.active.used = true;
    };
  }.bind(this));
};
