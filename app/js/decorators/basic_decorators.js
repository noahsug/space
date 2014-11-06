var BasicDecorators = di.service('BasicDecorators', [
  'EntityDecorator', 'Mouse']);

BasicDecorators.prototype.init = function() {
  this.entityDecorator_.addDecoratorObj(this);
};

BasicDecorators.prototype.decorateClickable_ = function(obj) {
  obj.update(function() {
    obj.mouseOver = obj.collides(this.mouse_.x, this.mouse_.y);
    obj.clicked = obj.mouseOver && this.mouse_.pressed;
  }.bind(this));
};


/**
 * @param {{health}} spec
 */
BasicDecorators.prototype.decorateHealth_ = function(obj, spec) {
  obj.health = spec.health;
  obj.dmg = function(dmg) {
    obj.health -= dmg;
    obj.dead = obj.health <= 0;
  };
};


/**
 * @param {{dmg}} spec
 */
BasicDecorators.prototype.decorateDmgCollision_ = function(obj, spec) {
  obj.affect(function() {
    if (obj.dead) return;
    var collides = _.some(obj.collidePoints, function(p) {
      return obj.target.collides(p.x, p.y);
    });
    if (collides) {
      obj.target.dmg(spec.dmg);
      obj.dead = true;
    }
  });
};
