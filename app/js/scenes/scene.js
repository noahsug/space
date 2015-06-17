var Scene = di.factory('Scene', ['GameModel as gm', 'Mouse']);

Scene.TRANSITION_TIME = .25;

Scene.prototype.init = function(name) {
  this.name_ = name;
  this.setState_('inactive');
  this.layout_ = {update: _.emptyFn};
};

Scene.prototype.setState_ = function(state) {
  this.gm_.scenes[this.name_] = state;
};

Scene.prototype.getState_ = function(state) {
  return this.gm_.scenes[this.name_];
};

Scene.prototype.start = function() {
  this.setState_('active');
  this.gm_.sceneStack.push(this.name_);
  this.onStart_();
};

Scene.prototype.onStart_ = function() {
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
      this.gm_.transition.done = true;
      this.gm_.scenes[this.transitionTo_] = 'start';
      this.end_();
    }
  }
};

Scene.prototype.resolve = function(dt) {
  var state = this.getState_();
  if (state == 'inactive') return;
  if (state == 'start') {
    this.start();
    this.update_(dt);
  }
};

Scene.prototype.update_ = function() {
  this.layout_.update();
};

Scene.prototype.goBackTo_ = function(scene, opt_speed) {
  var index = this.gm_.sceneStack.lastIndexOf(scene);
  this.gm_.sceneStack = this.gm_.sceneStack.slice(0, index || 0);
  this.transition_(scene, opt_speed);
};

Scene.prototype.goBack_ = function(opt_speed) {
  this.gm_.sceneStack.pop();
  this.transition_(_.last(this.gm_.sceneStack), opt_speed);
};

Scene.prototype.openModal_ = function(name) {
  this.gm_.scenes[name] = 'start';
};

Scene.prototype.closeAsModal_ = function(name) {
  this.gm_.sceneStack.pop();
  this.end_();
  this.gm_.scenes[_.last(this.gm_.sceneStack)] = 'start';
};

Scene.prototype.transitionFast_ = function(to) {
  this.transition_(to, 'fast');
};

Scene.prototype.transitionInstantly_ = function(to) {
  this.transition_(to, 'instant');
};

Scene.prototype.transition_ = function(to, opt_speed) {
  this.transitionTime_ = this.getTransitionTime_(opt_speed);
  this.setState_('transition');
  var pos = {screenX: this.mouse_.staticX, screenY: this.mouse_.staticY};
  this.gm_.transition.pos = pos;
  this.gm_.transition.time = this.transitionTime_;
  this.gm_.transition.done = false;
  this.transitionTo_ = to;
};

Scene.prototype.getTransitionTime_ = function(opt_speed) {
  switch (opt_speed) {
    case 'fast': return Scene.TRANSITION_TIME / 2;
    case 'instant': return 0;
    default: return Scene.TRANSITION_TIME;
  };
};

Scene.prototype.end_ = function() {
  this.setState_('inactive');
  this.onEnd_();
};

Scene.prototype.onEnd_ = function() {
  this.endActiveStates_();
  this.removeEntities_();
};

Scene.prototype.endActiveStates_ = function() {
  _.each(this.gm_.scenes, function(state, scene) {
    if (state == 'active') this.gm_.scenes[scene] = 'inactive';
  }, this);
};

Scene.prototype.removeEntities_ = function() {
  this.gm_.entities.clear();
};
