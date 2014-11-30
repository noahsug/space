var GameRunner = di.service('GameRunner', [
  'Game', 'Mouse', 'Renderer', 'requestAnimationFrame',
  'cancelAnimationFrame']);

GameRunner.MIN_FPS = 10;

GameRunner.prototype.init = function() {
  this.running_ = false;
};

GameRunner.prototype.isRunning = function() {
  return this.running_;
};

GameRunner.prototype.start = function() {
  this.game_.start();
  this.run();
};

GameRunner.prototype.run = function() {
  this.running_ = true;
  this.requestNextStep_();
};

GameRunner.prototype.stop = function() {
  this.cancelAnimationFrame_(this.frameRequest_);
  this.running_ = false;
};

GameRunner.prototype.step_ = function(prevStepTime) {
  var now = Date.now();
  var dt = (now - prevStepTime) / 1000;
  dt = Math.min(dt, 1 / GameRunner.MIN_FPS);
  this.update_(dt);
  this.requestNextStep_();
};

GameRunner.prototype.requestNextStep_ = function() {
  if (!this.running_) return;
  var now = Date.now();
  this.frameRequest_ = this.requestAnimationFrame_(this.step_.bind(this, now));
};

GameRunner.prototype.update_ = function(dt) {
  this.game_.update(dt);
  this.renderer_.update(dt);
  this.mouse_.clearInput();
};
