var Scene = di.factory('Scene', ['GameModel as gm', 'Mouse', 'textCtx']);

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
  this.gm_.sceneStack.push(this.name_);
  this.transitioning_ = null;
  this.onStart_();
  this.addEntities_();
};

Scene.prototype.onStart_ = _.emptyFn;

Scene.prototype.addEntities_ = _.emptyFn;

Scene.prototype.update = function(dt) {
  if (this.getState_() != 'active') return;
  this.update_(dt);
  if (this.transitioning_) this.updateTransition_(dt);
};

Scene.prototype.update_ = function(dt) {
  if (!this.layout_) return;
  this.layout_.update(dt);
};

Scene.prototype.updateTransition_ = function(dt) {
  this.transitioning_.time -= dt;
  if (this.transitioning_.time <= 0) {
    this.gm_.scenes[this.transitioning_.to] = 'start';
    this.onTransitionEnd_();
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

Scene.prototype.goBackTo_ = function(scene, opt_time) {
  var index = this.gm_.sceneStack.lastIndexOf(scene);
  this.gm_.sceneStack = this.gm_.sceneStack.slice(0, index || 0);
  this.transition_(scene, opt_time);
};

Scene.prototype.goBack_ = function(opt_time) {
  this.gm_.sceneStack.pop();
  this.transition_(_.last(this.gm_.sceneStack), opt_time);
};

Scene.prototype.openModal_ = function(name) {
  this.gm_.scenes[name] = 'start';
};

Scene.prototype.closeAsModal_ = function(name) {
  this.gm_.sceneStack.pop();
  this.end_();
  this.gm_.scenes[_.last(this.gm_.sceneStack)] = 'start';
};

Scene.prototype.transition_ = function(to, opt_time) {
  var time = _.isFinite(opt_time) ? opt_time : Time.TRANSITION;
  this.transitioning_ = {
    to: to,
    time: time,
    x: this.mouse_.staticX,
    y: this.mouse_.staticY
  };
  this.onTransition_();
};

Scene.prototype.onTransition_ = function() {
  if (!this.layout_) return;
  this.layout_.addFront(this.UiElement_.new().consumeClicks());
};

Scene.prototype.onTransitionEnd_ = function() {
  this.end_();
};

Scene.prototype.end_ = function() {
  this.setState_('inactive');
  this.endActiveStates_();
  this.removeEntities_();
  this.onEnd_();
};

Scene.prototype.onEnd_ = _.emptyFn;

Scene.prototype.endActiveStates_ = function() {
  _.each(this.gm_.scenes, function(state, scene) {
    if (state == 'active') this.gm_.scenes[scene] = 'inactive';
  }, this);
};

Scene.prototype.removeEntities_ = function() {
  this.gm_.entities.clear();
};
