var Entity = di.factory('Entity');

Entity.prototype.init = function(type) {
  this.type = type;
  this.setPos(0, 0);
  _.decorate(this, _.decorator.eventEmitter);
};

// Called before the first act().
Entity.prototype.awake = _.eventFn('awake');

// Take action (e.g. shoot a laser).
Entity.prototype.act_ = _.eventFn('act');
Entity.prototype.act = function(opt_callbackOrDt) {
  if (!_.isFunction(opt_callbackOrDt) && !this.awakened) {
    this.awakened = true;
    this.awake();
  }
  this.act_(opt_callbackOrDt);
};

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
