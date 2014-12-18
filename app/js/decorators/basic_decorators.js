var BasicDecorators = di.service('BasicDecorators', [
  'EntityDecorator', 'Mouse', 'Screen']);

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
    health: 0
  });
  obj.health = spec.health;
  obj.maxHealth = obj.health;
  obj.act(function() {
    obj.dmgTaken = 0;
  });
  obj.dmg = function(dmg) {
    obj.health -= dmg;
    obj.dmgTaken += dmg;
    obj.dead = obj.health <= 0;
  };
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

BasicDecorators.prototype.decorateScreenBound_ = function(obj, spec) {
  obj.act(function() {
    if (Math.abs(obj.x - this.screen_.x) > this.screen_.width / 2 + 50 ||
        Math.abs(obj.y - this.screen_.y) > this.screen_.height / 2 + 50) {
      obj.remove = true;
    }
  }.bind(this));
};

BasicDecorators.prototype.decorateEffect_ = function(obj, spec) {
  spec = _.options(spec, {
    duration: 0,
    effect: '',
    value: 1,
    effectOver: Function
  });

  // Only add event handler once - effects don't stack.
  if (_.isEmpty(obj.effects[spec.effect])) {
    obj.act(function(dt) {
      var effect = obj.effects[spec.effect];
      if (!effect.duration) return;
      if (effect.duration <= dt) {
        effect.duration.value = 0;
        effect.duration = 0;
        spec.effectOver();
      } else {
        effect.duration -= dt;
      }
    });
  }

  _.extend(obj.effects[spec.effect], spec);
};

BasicDecorators.prototype.decorateFreeze_ = function(obj) {
  var prevFns = _.pick(obj, 'act', 'affect', 'resolve', 'update');
  obj.act = obj.affect = obj.resolve = obj.update = Function;
  obj.unfreeze = function() {
    _.each(prevFns, function(fn, name) {
      obj[name] = fn;
    });
  };
};

BasicDecorators.prototype.decorateSlowToFreeze_ = function(obj, spec) {
  spec = _.options(spec, {
    duration: 0
  });
  _.each(['act', 'affect', 'resolve', 'update'], function(fnName) {
     obj[fnName] = slowDown(obj[fnName].bind(obj));
  });

  function slowDown(fn) {
    var duration = spec.duration;
    return function(dt) {
      if (duration <= 0) return;
      duration -= dt;
      fn((dt / 4) * (duration + .2) / spec.duration);
    };
  }
};

BasicDecorators.prototype.decorateStaticPosition_ = function(obj) {
  obj.staticPosition = true;
  obj.setPos = function(x, y) {
    obj.staticX = x;
    obj.staticY = y;
    obj.screenX = x + this.screen_.pixelWidth / 2;
    obj.screenY = y + this.screen_.pixelHeight / 2;
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
