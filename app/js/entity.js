var Entity = di.factory('Entity');

Entity.prototype.init = function(type) {
  this.type = type;
  this.x = this.y = 0;
  _.decorate(this, _.decorator.eventEmitter);
};

Entity.prototype.setPos = function(x, y) {
  this.x = x;
  this.y = y;
};

Entity.prototype.update = _.decorator.eventEmitter.eventFn('update');
