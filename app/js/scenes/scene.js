var Scene = di.factory('Scene', ['GameModel as gm', 'Mouse']);

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
  this.start_();
};

Scene.prototype.addEntities_ = _.emptyFn;

Scene.prototype.start_ = _.emptyFn;

Scene.prototype.update = function(dt) {
  var state = this.getState_();
  if (state == 'inactive' || state == 'start') return;
  else if (state == 'active') this.update_(dt);
  else if (state == 'transition') {
    this.transitionTime_ -= dt;
    if (this.transitionTime_ <= 0) {
      this.transitionOver_();
      this.gm_.transition.done = true;
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

Scene.prototype.transition_ = function(to, opt_time) {
  this.transitionTime_ = _.orDef(opt_time, Scene.TRANSITION_TIME);
  this.setState_('transition');
  var pos = {screenX: this.mouse_.screenX, screenY: this.mouse_.screenY};
  this.gm_.transition.pos = pos;
  this.gm_.transition.time = this.transitionTime_;
  this.gm_.transition.done = false;
  this.transitionTo_ = to;
};

Scene.prototype.transitionFast_ = function(to) {
  this.transition_(to, Scene.TRANSITION_TIME / 2);
};

Scene.prototype.transitionInstantly_ = function(to) {
  this.transition_(to, 0);
};

Scene.prototype.transitionOver_ = function() {
  this.removeEntities_();
  this.end_();
};

Scene.prototype.removeEntities_ = function() {
  this.gm_.entities.clear();
};

Scene.prototype.end_ = _.emptyFn;

Scene.prototype.restartGame_ = function() {
  var scenes = this.gm_.scenes;
  var player = this.gm_.player;
  var inventory = this.gm_.inventory;
  this.gm_.init();
  this.gm_.scenes = scenes;
  this.gm_.player = player;
  this.gm_.inventory = inventory;
};
