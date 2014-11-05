var Entity = di.factory('Entity');

Entity.prototype.init = function(type) {
  this.type = type;
  this.x = this.y = 0;
  this.firstAction_ = true;
  _.decorate(this, _.decorator.eventEmitter);
};

Entity.prototype.awake = _.decorator.eventEmitter.eventFn('awake');

Entity.prototype.act_ = _.decorator.eventEmitter.eventFn('act');
Entity.prototype.act = function() {
  if (this.firstAction_ && !_.isFunction(arguments[0])) {
    this.firstAction_ = false;
    this.awake();
  }
  this.act_.apply(this, _.args(arguments));
};

Entity.prototype.affect = _.decorator.eventEmitter.eventFn('affect');

Entity.prototype.resolve = _.decorator.eventEmitter.eventFn('resolve');

Entity.prototype.update = _.decorator.eventEmitter.eventFn('update');

Entity.prototype.setPos = function(x, y) {
  this.x = x;
  this.y = y;
};
