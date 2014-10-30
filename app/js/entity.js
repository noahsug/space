var Entity = di.factory('Entity');

Entity.THINK_TIME = .25;

Entity.prototype.init = function(type) {
  this.type = type;
  this.x = this.y = 0;
  this.nextAction_ = 0;
  this.firstThought_ = true;
  _.decorate(this, _.decorator.eventEmitter);
};

Entity.prototype.setPos = function(x, y) {
  this.x = x;
  this.y = y;
};

Entity.prototype.update = function(dt) {
  if (this.firstThought_) {
    this.firstThought_ = false;
    this.awake();
  }
  if (dt < this.nextAction_) {
    this.act(dt);
    this.nextAction_ -= dt;
  } else {
    this.think();
    dt -= this.nextAction_;
    this.nextAction_ = Entity.THINK_TIME;
    if (dt > 0) {
      this.update(dt);
    }
  }
};

Entity.prototype.awake = _.decorator.eventEmitter.eventFn('awake');

Entity.prototype.think = _.decorator.eventEmitter.eventFn('think');

Entity.prototype.act = _.decorator.eventEmitter.eventFn('act');
