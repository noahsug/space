var Entity = di.factory('Entity');

Entity.prototype.init = function(type) {
  this.effects = {
    stun: {}
  };
  this.type = type;
  this.setPos(0, 0);
  _.decorate(this, _.decorator.eventEmitter);
};

// Called before the first act().
Entity.prototype.awake = _.decorator.eventEmitter.eventFn('awake');

// Take action (e.g. shoot a laser).
Entity.prototype.act_ = _.decorator.eventEmitter.eventFn('act');
Entity.prototype.act = function(opt_callbackOrArg) {
  if (!this.awakened_ && !_.isFunction(opt_callbackOrArg)) {
    this.awakened_ = true;
    this.awake();
  }
  this.act_(opt_callbackOrArg);
};

// Be affected by other entities (e.g. collide with a laser).
Entity.prototype.affect = _.decorator.eventEmitter.eventFn('affect');

// Resolve effects (e.g. die due to too much damage).
Entity.prototype.resolve = _.decorator.eventEmitter.eventFn('resolve');

// Update position / animations.
Entity.prototype.update = _.decorator.eventEmitter.eventFn('update');

Entity.prototype.setPos = function(x, y) {
  this.x = x;
  this.y = y;
};
