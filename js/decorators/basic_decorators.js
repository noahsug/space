var BasicDecorators = di.service('BasicDecorators', [
  'EntityDecorator', 'Mouse', 'Screen', 'GameModel as gm',
  'SharedComputation as c', 'DecoratorUtil as util']);

BasicDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'base');
};

BasicDecorators.prototype.decorateClickable_ = function(obj) {
  obj.update(function() {
    obj.mouseOver = obj.collides(this.mouse_);
    obj.clicked = obj.mouseOver && this.mouse_.pressed;
  }.bind(this));
};

BasicDecorators.prototype.decorateHealth_ = function(obj, spec) {
  spec = _.options(spec, {
    health: 30
  });
  obj.health = obj.maxHealth = obj.prevHealth = spec.health;
  obj.dmg = function(dmg) {
    obj.health -= dmg / obj.def;
  };
  obj.act(function() {
    obj.prevHealth = obj.health;
  });
  obj.resolve(function() {
    if (obj.health <= 0) {
      obj.dead = true;
    }
  }.bind(this));
};

BasicDecorators.prototype.decorateStats_ = function(obj, stats) {
  stats = stats || {};
  if (stats.dmg) this.util_.mod(obj, 'primary.dmg', 1 + stats.dmg / 100);
  if (stats.dmg) this.util_.mod(obj, 'secondary.dmg', 1 + stats.dmg / 100);
  if (stats.health) this.util_.mod(obj, 'health', 1 + stats.health / 100);
  if (stats.speed) this.util_.mod(obj, 'movement.speed', 1 + stats.speed / 100);
  if (stats.def) this.util_.mod(obj, 'def', 1 + stats.def / 100);
};

// Requires obj.movement.speed.
BasicDecorators.prototype.decorateRange_ = function(obj, spec) {
  spec = _.options(spec, {
    range: 0
  });
  obj.remainingDistance = spec.range;
  obj.act(function(dt) {
    obj.remainingDistance -= obj.movement.speed * dt;
  });
  obj.resolve(function(dt) {
    if (obj.remainingDistance <= 0) {
      obj.dead = true;
    }
  });
};

BasicDecorators.prototype.decorateDmgCollision_ = function(obj, spec) {
  spec = _.options(spec, {
    dmg: 0
  });
  this.decorateCollision_(obj, {collide: function() {
    obj.target.dmg(spec.dmg);
    obj.dead = true;
  }});
};

BasicDecorators.prototype.decorateCollision_ = function(obj, spec) {
  obj.affect(function() {
    if (obj.dead || obj.target.dead) return;
    if (obj.collides(obj.target)) {
      if (obj.target.teleport && obj.target.teleport.ready) {
        obj.target.teleport.use = true;
      } else {
        spec.collide(obj, spec);
      }
    }
  });
};

BasicDecorators.prototype.decorateRemoveOffScreen_ = function(obj, spec) {
  obj.act(function() {
    if (this.c_.hitWall(obj, 50)) obj.remove = true;
  }.bind(this));
};

// disabled: stops cooldowns, attacks and control of movement.
// weaponsDisabled: no primary or secondary weapons.
BasicDecorators.prototype.decorateEffectable_ = function(obj) {
  var effectNames = [];
  obj.effect = {};
  obj.onEffectEnd = {};
  obj.addEffect = function(effect, duration, opt_onEffectEnd) {
    var currentDuration = obj.effect[effect];
    if (!_.isDef(currentDuration)) effectNames.push(effect);
    obj.effect[effect] = Math.max(currentDuration || 0, duration);
    obj.onEffectEnd[effect] = opt_onEffectEnd;
  };

  obj.act(function(dt) {
    for (var i = 0; i < effectNames.length; i++) {
      var name = effectNames[i];
      if (!obj.effect[name]) continue;
      if (obj.effect[name] <= dt) {
        obj.effect[name] = 0;
        obj.onEffectEnd[name] && obj.onEffectEnd[name]();
      } else {
        obj.effect[name] -= dt;
      }
    }
  });
};

BasicDecorators.prototype.decorateFreeze_ = function(obj) {
  _.each(['act', 'affect', 'resolve', 'update'], function(fn) {
    obj[fn] = _.emptyFn;
  });
};

BasicDecorators.prototype.decorateSlow_ = function(obj) {
  var prevFns = _.pick(obj, 'act', 'affect', 'resolve', 'update');

  _.each(prevFns, function(fn, name) {
    obj[name] = this.slow_(fn.bind(obj), 0);
  }, this);

  obj.unfreeze = function() {
    _.each(prevFns, function(fn, name) {
      obj[name] = fn.bind(obj);
    });
  };
};

BasicDecorators.prototype.slow_ = function(fn, slow) {
  return function(opt_callbackOrArg) {
    if (_.isFunction(opt_callbackOrArg)) {
      fn(opt_callbackOrArg);
    } else {
      var dt = opt_callbackOrArg;
      fn(dt * slow);
    }
  };
};

BasicDecorators.prototype.decorateStaticPosition_ = function(obj) {
  obj.staticPosition = true;
  obj.setPos = function(x, y) {
    obj.staticX = x;
    obj.staticY = y;
    obj.screenX = x * this.screen_.upscale;
    obj.screenY = y * this.screen_.upscale;
    var pos = this.screen_.screenToCanvas(obj.screenX, obj.screenY);
    obj.x = pos.x;
    obj.y = pos.y;
  }.bind(this);
  obj.setY = function(y) {
    this.setPos(obj.staticX, y);
  }.bind(obj);
  obj.setX = function(x) {
    this.setPos(x, obj.staticY);
  }.bind(obj);
};
