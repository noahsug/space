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
  obj.affect(function() {
    if (obj.dead) return;
    if (obj.collides(obj.target)) {
      // TODO(sugarman): Create additive property (e.g. canAvoidCollision).
      if (obj.target.teleport && obj.target.teleport.ready) {
        obj.target.teleport.use = true;
      } else {
        obj.target.dmg(spec.dmg);
        obj.dead = true;
      }
    }
  });
};

BasicDecorators.prototype.decorateFreeze_ = function(obj) {
  obj.act = obj.affect = obj.resolve = obj.update = Function;
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
