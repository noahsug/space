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
  spec = _.spec(spec, {
    health: 30
  });
  obj.health = obj.maxHealth = obj.prevHealth = spec.health;
  obj.dmg = function(dmg, source) {
    if (obj.maybeShieldDmg && obj.maybeShieldDmg(source)) return;
    obj.health -= dmg;
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

// Requires obj.movement.speed.
BasicDecorators.prototype.decorateRange_ = function(obj, spec) {
  spec = _.spec(spec, {
    range: 1000
  });
  obj.maxRange = obj.remainingRange = spec.range;
  obj.act(function(dt) {
    obj.remainingRange -= obj.movement.speed * dt;
  });
  obj.resolve(function(dt) {
    if (obj.remainingRange <= 0) {
      obj.dead = true;
    }
  });
};

BasicDecorators.prototype.decorateDmgCollision_ = function(obj, spec) {
  spec = _.spec(spec, {
    dmg: 0
  });
  this.decorateCollision_(obj, {collide: function() {
    obj.target.dmg(spec.dmg, obj);
    obj.dead = true;
  }});
};

BasicDecorators.prototype.decorateCollision_ = function(obj, spec) {
  obj.affect(function() {
    if (obj.dead || obj.target.dead) return;
    if (obj.collides(obj.target)) {
      if (obj.target.maybeReflect && obj.target.maybeReflect(obj)) return;
      spec.collide(obj, spec);
    }
  });
};

BasicDecorators.prototype.decorateRemoveOffScreen_ = function(obj, spec) {
  obj.act(function() {
    if (this.c_.hitWall(obj, 50)) obj.dead = true;
  }.bind(this));
};

// rooted: stops movement control.
// silenced: stops actives.
// stunned: stops actives and movement control.
// disabled: visually mark the ship as disabled.
BasicDecorators.prototype.decorateEffectable_ = function(obj) {
  var effects = [];
  obj.effect = {};
  obj.onEffectEnd = {};
  obj.addEffect = function(effect, duration, opt_onEffectEnd) {
    // Add multiple effects, seperated by a space.
    if (effect.indexOf(' ') != -1) {
      var effectsToAdd = effect.split(' ');
      effect = effectsToAdd[0];
      for (var i = 1; i < effectsToAdd.length; i++) {
        obj.addEffect(effectsToAdd[i], duration);
      }
    }

    // Stunned = silenced + rooted.
    if (effect == 'stunned') {
      obj.addEffect('silenced', duration);
      obj.addEffect('rooted', duration * .9);
    }

    var currentDuration = obj.effect[effect];
    if (!_.isDef(currentDuration)) effects.push(effect);
    else if (obj.onEffectEnd[effect]) obj.onEffectEnd[effect]();
    obj.effect[effect] = duration;
    obj.onEffectEnd[effect] = opt_onEffectEnd;
  };

  obj.act(function(dt) {
    for (var i = 0; i < effects.length; i++) {
      var effect = effects[i];
      if (!obj.effect[effect]) continue;
      if (obj.effect[effect] <= dt) {
        obj.effect[effect] = 0;
        obj.onEffectEnd[effect] && obj.onEffectEnd[effect]();
      } else {
        obj.effect[effect] -= dt;
      }
    }
  });
};

BasicDecorators.prototype.decorateGrowRadiusAndDie_ = function(obj, spec) {
  obj.grow = spec.grow;
  obj.growDuration = spec.growDuration;
  obj.update(function(dt) {
    if (!obj.growDuration) obj.dead = true;
    obj.radius += Math.min(dt, obj.growDuration) * obj.grow;
    obj.growDuration = Math.max(obj.growDuration - dt, 0);
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
