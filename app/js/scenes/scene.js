var Scene = di.factory('Scene', ['GameModel as gm']);

Scene.prototype.init = function(base) {
  this.base_ = base;
  this.gm_.scenes[base.name] = 'inactive';
};

Scene.prototype.start = function() {
  this.gm_.scenes[this.base_.name] = 'active';
  this.base_.addEntities && this.base_.addEntities();
};

Scene.prototype.update = function(dt) {
  var state = this.gm_.scenes[this.base_.name];
  this.base_.update && this.base_.update(dt, state);
};

Scene.prototype.resolve = function(dt) {
  var state = this.gm_.scenes[this.base_.name];
  this.base_.resolve && this.base_.resolve(dt, state);
  if (state == 'start') {
    this.start();
    this.update();
  }
};
