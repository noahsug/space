var Entity = di.factory('Entity');

Entity.prototype.init = function(type) {
  this.type = type;
  this.x = this.y = 0;
  this.decorators_ = {};
};

Entity.prototype.decorate = function(decorator) {
  this.decorators_[decorator.name] = decorator;
};

Entity.prototype.update = function(dt) {
  _.each(this.decorators_, function(d) {
    d.update(dt);
  }, this);
};

Entity.prototype.setPos = function(x, y) {
  this.x = x;
  this.y = y;
};
