var BasicDecorator = di.service('BasicDecorator', [
  'EntityDecorator', 'Mouse', 'Screen', 'GameModel as gm', 'ShipFactory',
  'SharedComputation as c', 'DecoratorUtil as util']);

BasicDecorator.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'base');
};

BasicDecorator.prototype.decorateClickable_ = function(obj) {
  obj.update(function() {
    obj.mouseOver = obj.collides(this.mouse_);
    if (obj.clicked == this.gm_.time) obj.clicked = false;
    else obj.clicked = obj.mouseOver && this.mouse_.pressed && this.gm_.time;
  }.bind(this));
};

BasicDecorator.prototype.decorateHealth_ = function(obj, spec) {
  spec = this.util_.spec(spec, {
    health: Health.DEFAULT
  });
  obj.def = 1;

  obj.setMaxHealth = function(health) {
    obj.health = obj.maxHealth = obj.prevHealth = health;
  };
  obj.setMaxHealth(spec.health);

  obj.dmg = function(dmg, source) {
    obj.health -= dmg / obj.def;
  };

  obj.act(function() {
    if (obj.health > obj.maxHealth) obj.setMaxHealth(obj.health);
    obj.prevHealth = obj.health;
  });

  obj.resolve(function() {
    if (obj.health <= 0) {
      obj.dead = true;
    }
  }.bind(this));
};

// Requires obj.movement.speed.
BasicDecorator.prototype.decorateRange_ = function(obj, spec) {
  spec = this.util_.spec(spec, {
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

BasicDecorator.prototype.decorateClonable_ = function(obj, spec) {
  obj.clones = [obj];
  obj.getLivingClone = function() {
    if (!obj.dead) return obj;
    for (var i = 0; i < obj.clones.length; i++) {
      var clone = obj.clones[i];
      if (!clone.dead) return clone;
    }
    return obj;
  };

  obj.addClone = function(dna, opt_style) {
    var clone = this.shipFactory_.createShip(dna, opt_style || obj.style);
    this.shipFactory_.setTargets(clone, obj.target);
    obj.clones.push(clone);
    clone.clones = obj.clones;
    return clone;
  }.bind(this);
};

BasicDecorator.prototype.decorateRotates_ = function(obj, spec) {
  obj.turnSpeed = Speed.TURN_SPEED;

  obj.awake(function() {
    obj.rotation = _.angle(obj, obj.target);
  });

  obj.update(function(dt) {
    if (obj.effect.rooted) return;
    obj.rotation = _.approachAngle(
        obj.rotation, obj.c.targetAngle, obj.turnSpeed * dt);
  });
};

BasicDecorator.prototype.decorateSelectsTarget_ = function(obj, spec) {
  var selectTime = 0;
  obj.act(function(dt) {
    if (obj.target.dead || this.gm_.time - selectTime > 10) {
      obj.target = selectClosestTarget();
      selectTime = this.gm_.time;
    }
  }.bind(this));

  function selectClosestTarget() {
    if (obj.target.clones.length == 1) return obj.target;

    var minDis = Infinity;
    var target = obj.target;
    for (var i = 0; i < obj.target.clones.length; i++) {
      var clone = obj.target.clones[i];
      if (clone.dead) continue;
      var dis = clone.effect.invisible ? 999999 : _.distance(obj, clone);
      if (dis < minDis) {
        minDis = dis;
        target = clone;
      }
    }
    return target;
  }
};

BasicDecorator.prototype.decorateShipCollision_ = function(obj, spec) {
  this.util_.spec(obj, 'collision', spec, {
    dmg: 10,
    targetDmgRatio: 1,
    stunDuration: .75
  });
  var lastCollided = {};
  obj.precollide(function(target) {
    if (this.gm_.tick - lastCollided[target] <= 2) {
      obj.shouldCollide = false;
    }
    lastCollided[target] = this.gm_.tick;
  }, this);
  obj.collide(function(target) {
    obj.dmg(obj.collision.dmg * target.collision.targetDmgRatio, target);
    // Move away from collided target at half speed.
    obj.movement.vector = _.vector.cartesian(
        {angle: obj.c.targetAngle, length: -.5});
    obj.addEffect('stunned', obj.collision.stunDuration);
    obj.addEffect('collided', obj.collision.collisionDuration);
  });
};

BasicDecorator.prototype.decorateFiresProjectiles_ = function(obj) {
  obj.prefire = _.eventFn('prefire');
  obj.postfire = _.eventFn('postfire');
};

BasicDecorator.prototype.decorateEffectCollision_ = function(obj, spec) {
  spec = this.util_.spec(spec, {
    effect: null,
    duration: 0
  });
  obj.effect = spec.effect;
  obj.duration = spec.duration;
  obj.collide(function(target) {
    target.addEffect(obj.effect, obj.duration);
  });
};

BasicDecorator.prototype.decorateDmgCollision_ = function(obj, spec) {
  spec = this.util_.spec(spec, {
    dmg: 0
  });
  obj.dmg = spec.dmg;
  obj.collide(function(target) {
    target.dmg(obj.dmg, obj);
  });
};

BasicDecorator.prototype.decorateDieOnCollision_ = function(obj, spec) {
  obj.collide(function() { obj.dead = true; });
};

BasicDecorator.prototype.decorateProjectileCollidable_ = function(obj) {
  this.decorateCollidable_(obj);
};

BasicDecorator.prototype.decorateCollidable_ = function(obj) {
  obj.shouldCollide = false;
  obj.precollide = _.eventFn('precollide');
  obj.collide = _.eventFn('collide');
  obj.receivedPrecollide = _.eventFn('receivedPrecollide');
  obj.receivedCollide = _.eventFn('receivedCollide');

  obj.affect(function() {
    for (var i = 0; i < obj.target.clones.length; i++) {
      maybeCollide(obj.target.clones[i]);
    }
  });

  function maybeCollide(target) {
    if (!obj.dead && !target.dead && obj.collides(target)) {
      obj.shouldCollide = true;
      obj.precollide(target);
      if (obj.shouldCollide) target.receivedPrecollide(obj);
      if (obj.shouldCollide) {
        obj.collide(target);
        target.receivedCollide(obj);
        obj.shouldCollide = false;
      }
      //if (target.maybeReflect && target.maybeReflect(obj)) return;
    }
  }
};

BasicDecorator.prototype.decorateRemoveOffScreen_ = function(obj, spec) {
  obj.act(function() {
    if (this.c_.hitWall(obj, 50)) obj.dead = true;
  }.bind(this));
};

// rooted: stops movement control.
// silenced: stops actives.
// stunned: stops actives and movement control.
// disabled: visually mark the ship as disabled.
// invisible: stops target from firing projectiles and causes confused movement.
// displaced: ship is being forcably moved around the map.
BasicDecorator.prototype.decorateEffectable_ = function(obj) {
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
      obj.addEffect('rooted', duration);
    }

    var currentDuration = obj.effect[effect];
    if (!_.isDef(currentDuration)) effects.push(effect);
    else if (obj.onEffectEnd[effect]) obj.onEffectEnd[effect]();
    obj.effect[effect] = duration;
    obj.onEffectEnd[effect] = opt_onEffectEnd;
  };

  obj.stopEffect = function(effect) {
    obj.addEffect(effect, 0);
  };

  obj.act(function(dt) {
    computeEffects();
    tickEffects(dt);
  });

  function computeEffects() {
    obj.effect.targetlessMovement = obj.target.effect.invisible;
    obj.effect.targetlessActive = obj.target.effect.invisible ||
                                  obj.effect.invisible;
    obj.effect.canDash = !obj.effect.targetlessMovement &&
                         !obj.effect.silenced &&
                         !obj.effect.rooted;
  }

  function tickEffects(dt) {
    for (var i = 0; i < effects.length; i++) {
      var effect = effects[i];
      if (obj.effect[effect] <= dt) {
        obj.effect[effect] = 0;
        if (obj.onEffectEnd[effect]) {
          obj.onEffectEnd[effect]();
          obj.onEffectEnd[effect] = null;
        }
      } else {
        obj.effect[effect] -= dt;
      }
    }
  }
};

BasicDecorator.prototype.decorateGrowRadiusAndDie_ = function(obj, spec) {
  obj.grow = spec.grow;
  obj.minRadius = spec.minRadius;
  obj.maxRadius = spec.maxRadius;
  var shouldDie = false;
  obj.update(function(dt) {
    if (obj.dead) return;
    if (shouldDie) {
      obj.dead = true;
      return;
    }
    obj.radius += obj.grow * dt;
    if (obj.radius < obj.minRadius || obj.radius > obj.maxRadius) {
      obj.radius = obj.radius < obj.minRadius ? obj.minRadius : obj.maxRadius;
      shouldDie = true;
    }
  });
};

BasicDecorator.prototype.decorateFreeze_ = function(obj) {
  _.each(['act', 'affect', 'resolve', 'update'], function(fn) {
    obj[fn] = _.emptyFn;
  });
};

BasicDecorator.prototype.decorateSlow_ = function(obj) {
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

BasicDecorator.prototype.slow_ = function(fn, slow) {
  return function(opt_callbackOrArg) {
    if (_.isFunction(opt_callbackOrArg)) {
      fn(opt_callbackOrArg);
    } else {
      var dt = opt_callbackOrArg;
      fn(dt * slow);
    }
  };
};

BasicDecorator.prototype.decorateStaticPosition_ = function(obj) {
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
