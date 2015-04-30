var AugmentDecorator = di.service('AugmentDecorator', [
  'EntityDecorator', 'DecoratorUtil as util', 'Mouse',
  'SharedComputation as c']);

AugmentDecorator.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'augment');
};

AugmentDecorator.prototype.decorateArchery_ = function(obj) {
  var minDistance = 250;
  var on = false;
  obj.prefire(function(proj) {
    if (proj.spec.name != 'primary') return;
    if (on) {
      stop();
      return;
    }
    if (obj.c.targetDis < minDistance) return;

    obj.addEffect('setPrimaryCooldown', Infinity, stop);
    on = true;
    this.util_.modSet(obj, 'primary.cooldown', .2);
  }, this);

  var stop = function() {
    if (!on) return;
    on = false;
    obj.effect.setPrimaryCooldown = 0;
    this.util_.modSet(obj, 'primary.cooldown', null);
  }.bind(this);
};

AugmentDecorator.prototype.decorateExtreme_ = function(obj, spec) {
  _.each(Game.ITEM_TYPES, function(type) {
    this.util_.mod(obj, type + '.dmg', 2);
  }, this);
  this.util_.mod(obj, 'health', .5);
};

AugmentDecorator.prototype.decorateMedic_ = function(obj, spec) {
  obj.act(function(dt) {
    if (obj.health < obj.maxHealth) obj.health += 1 * dt;
  });
};

AugmentDecorator.prototype.decorateCamo_ = function(obj, spec) {
  this.util_.modSet(obj, 'primary.targetless', true);
  this.util_.modSet(obj, 'secondary.targetless', true);
};

AugmentDecorator.prototype.decorateMulti_ = function(obj, spec) {
  spec = this.util_.spec(spec, {
    projectiles: 0
  });
  this.util_.modAdd(obj, 'primary.projectiles', spec.projectiles);
};

AugmentDecorator.prototype.decorateHeavy_ = function(obj, spec) {
  spec = this.util_.spec(spec, {
    speedRatio: 1,
    healthRatio: 1
  });
  this.util_.mod(obj, 'health', spec.healthRatio);
  this.util_.mod(obj, 'movement.speed', spec.speedRatio);
};

AugmentDecorator.prototype.decorateSharp_ = function(obj, spec) {
  spec = this.util_.spec(spec, {
    dmgRatio: 1
  });
  this.util_.mod(obj, 'collision.targetDmgRatio', spec.dmgRatio);
};

AugmentDecorator.prototype.decorateTeleClick_ = function(obj) {
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

AugmentDecorator.prototype.decorateFreezeClick_ = function(obj) {
  var spec = {
    duration: 2
  };
  this.onClick_(obj, function() {
    obj.target.addEffect('stunned', spec.duration);
    obj.target.movement.vector = {x: 0, y: 0};
  }, this);
};

AugmentDecorator.prototype.onClick_ = function(obj, fn, opt_context) {
  obj.update(function() {
    if (obj.active.used) return;
    if (this.mouse_.pressed) {
      fn.call(opt_context);
      obj.active.used = true;
    };
  }.bind(this));
};
