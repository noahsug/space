var BasicDecorators = di.service('BasicDecorators', [
  'EntityDecorator', 'Mouse']);

BasicDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this, 'base');
};

BasicDecorators.prototype.decorateClickable_ = function(obj) {
  obj.update(function() {
    obj.mouseOver = obj.collides(this.mouse_.x, this.mouse_.y);
    obj.clicked = obj.mouseOver && this.mouse_.pressed;
  }.bind(this));
};

BasicDecorators.prototype.decorateHealth_ = function(obj, spec) {
  spec = _.options(spec, {
    health: 0
  });
  obj.health = spec.health;
  obj.dmg = function(dmg) {
    obj.health -= dmg;
    obj.dead = obj.health <= 0;
  };
};

BasicDecorators.prototype.decorateDmgCollision_ = function(obj, spec) {
  spec = _.options(spec, {
    dmg: 0
  });
  obj.affect(function() {
    if (obj.dead) return;
    var collides = _.some(obj.collidePoints, function(p) {
      return obj.target.collides(p.x, p.y);
    });
    if (collides) {
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
