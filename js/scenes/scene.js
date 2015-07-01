var Scene = di.factory('Scene', [
  'UiElement', 'GameModel as gm', 'Mouse', 'textCtx', 'BackdropElement',
  'FadeElement']);

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
  this.numStartingEntities_ = this.gm_.entities.length;
  this.setState_('active');
  this.gm_.sceneStack.push(this.name_);
  this.transitioning_ = null;
  this.onStart_();
  this.addEntities_();
  this.gm_.config = {};
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
    this.onTransitionEnd_();
    if (this.gm_.scenes[this.transitioning_.to] != 'active') {
      this.gm_.scenes[this.transitioning_.to] = 'start';
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

Scene.prototype.goBackTo_ = function(scene, opt_options) {
  var o = _.options(opt_options, {
    closeActiveStates: true
  });
  var index = this.gm_.sceneStack.lastIndexOf(scene) || 0;
  this.gm_.sceneStack = this.gm_.sceneStack.slice(0, index);
  this.transition_(scene, o);
};

Scene.prototype.goBack_ = function(opt_options) {
  this.gm_.sceneStack.pop();
  this.transition_(_.last(this.gm_.sceneStack), opt_options);
};

Scene.prototype.openModal_ = function(name) {
  this.gm_.scenes[name] = 'start';
};

Scene.prototype.transition_ = function(to, opt_options) {
  var o = _.options(opt_options, {
    time: Time.TRANSITION,
    closeActiveStates: false
  });
  this.transitioning_ = {
    to: to,
    time: o.time,
    closeActiveStates: o.closeActiveStates
  };
  this.onTransition_();
};

Scene.prototype.onTransition_ = function() {
  if (!this.layout_) return;
  this.layout_.addFront(this.UiElement_.new().consumeClicks());
};

Scene.prototype.fadeIn_ = function(opt_time) {
  var time = _.isFinite(opt_time) ? opt_time : Time.TRANSITION_FAST;
  this.layout_.setAlpha(0).animate('alpha', 1, {duration: time});
};

Scene.prototype.fadeOut_ = function(opt_time) {
  var time = _.isFinite(opt_time) ? opt_time : this.transitioning_.time;
  this.layout_.animate('alpha', 0, {duration: time});
};

Scene.prototype.fadeToBlack_ = function(opt_time) {
  var time = _.isFinite(opt_time) ? opt_time : this.transitioning_.time;
  this.layout_.add(this.FadeElement_.new()
    .setAlpha(0)
    .animate('alpha', 1, {duration: time}));
};

Scene.prototype.fadeFromBlack_ = function(opt_time) {
  var time = _.isFinite(opt_time) ? opt_time : Time.TRANSITION_FAST;
  this.layout_.add(this.FadeElement_.new()
    .animate('alpha', 0, {duration: time}));
};

Scene.prototype.onTransitionEnd_ = function() {
  this.end_();
};

Scene.prototype.end_ = function() {
  this.setState_('inactive');
  if (this.transitioning_.closeActiveStates) {
    this.endActiveStates_();
    this.removeAllEntities_();
  } else {
    this.removeOwnEntities_();
  }
  this.onEnd_();
};

Scene.prototype.onEnd_ = _.emptyFn;

Scene.prototype.endActiveStates_ = function() {
  _.each(this.gm_.scenes, function(state, scene) {
    if (state == 'active') this.gm_.scenes[scene] = 'inactive';
  }, this);
};

Scene.prototype.removeAllEntities_ = function() {
  this.gm_.entities.clear();
};

Scene.prototype.removeOwnEntities_ = function() {
  this.gm_.entities.length = this.numStartingEntities_;
};
