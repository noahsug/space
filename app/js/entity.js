var Entity = di.factory('Entity');

Entity.prototype.init = function(type) {
  this.type = type;
  this.setPos(0, 0);
  _.decorate(this, _.decorator.eventEmitter);

  // Call awake on the first act.
  this.act(function() {
    if (!this.awakened) {
      this.awakened = true;
      this.awake();
    }
  }, this);
};

// Called before the first act().
Entity.prototype.awake = _.eventFn('awake');

// Take action (e.g. shoot a laser).
Entity.prototype.act = _.eventFn('act');

// Be affected by other entities (e.g. collide with a laser).
Entity.prototype.affect = _.eventFn('affect');

// Resolve effects (e.g. die due to too much damage).
Entity.prototype.resolve = _.eventFn('resolve');

// Update position / animations.
Entity.prototype.update = _.eventFn('update');

Entity.prototype.setPos = function(x, y) {
  this.x = x;
  this.y = y;
};
