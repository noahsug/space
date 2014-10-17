var GameRunner = di.service('GameRunner', [
  'Game', 'Renderer', 'requestAnimationFrame', 'cancelAnimationFrame']);

GameRunner.MIN_FPS = 10;

GameRunner.prototype.init = function() {
  this.running_ = false;
};

GameRunner.prototype.run = function() {
  if (!this.running_) {
    this.running_ = true;
    this.requestNextStep_();
  }
};

GameRunner.prototype.stop = function() {
  if (this.running_) {
    this.cancelAnimationFrame_(this.frameRequest_);
    this.running_ = false;
  }
};

GameRunner.prototype.step_ = function(prevStepTime) {
  var now = Date.now();
  var dt = (now - prevStepTime) / 1000;
  dt = Math.min(dt, 1 / GameRunner.MIN_FPS);
  this.update_(dt);
  this.requestNextStep_();
};

GameRunner.prototype.requestNextStep_ = function() {
  var now = window.Date.now();
  this.frameRequest_ = this.requestAnimationFrame_(this.step_.bind(this, now));
};

GameRunner.prototype.update_ = function(dt) {
  this.game_.update(dt);
  this.renderer_.update(dt);
};
