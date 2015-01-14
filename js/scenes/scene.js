var Scene = di.factory('Scene', ['GameModel as gm']);

Scene.TRANSITION_TIME = .25;

Scene.prototype.init = function(name) {
  this.name_ = name;
  this.setState_('inactive');
};

Scene.prototype.setState_ = function(state) {
  this.gm_.scenes[this.name_] = state;
};

Scene.prototype.getState_ = function(state) {
  return this.gm_.scenes[this.name_];
};

Scene.prototype.start = function() {
  this.setState_('active');
  this.addEntities_();
};

Scene.prototype.addEntities_ = _.emptyFn;

Scene.prototype.update = function(dt) {
  var state = this.getState_();
  if (state == 'inactive' || state == 'start') return;
  else if (state == 'active') this.update_(dt);
  else if (state == 'transition') {
    this.transitionTime_ -= dt;
    if (this.transitionTime_ <= 0) {
      this.transitionOver_();
      this.gm_.transition = null;
      this.setState_('inactive');
      this.gm_.scenes[this.transitionTo_] = 'start';
    }
  }
};

Scene.prototype.resolve = function(dt) {
  var state = this.getState_();
  if (state == 'inactive') return;
  if (state == 'start') {
    this.start();
    this.update_();
  }
};

Scene.prototype.update_ = _.emptyFn;

Scene.prototype.transition_ = function(entity, to) {
  this.setState_('transition');
  this.gm_.transition = {pos: entity};
  this.transitionTime_ = Scene.TRANSITION_TIME;
  this.transitionTo_ = to;
};

Scene.prototype.transitionOver_ = function() {
  this.removeEntities_();
};

Scene.prototype.removeEntities_ = function() {
  this.gm_.entities.clear();
};
