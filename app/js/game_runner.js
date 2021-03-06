var GameRunner = di.service('GameRunner', [
  'Game', 'Mouse', 'Renderer', 'requestAnimationFrame',
  'cancelAnimationFrame', 'GameModel as gm']);

GameRunner.MIN_DT = 1 / 15;  // 15 FPS.

GameRunner.prototype.init = function() {
  this.running_ = false;
  this.boundStep_ = this.step_.bind(this);
};

GameRunner.prototype.isRunning = function() {
  return this.running_;
};

GameRunner.prototype.start = function() {
  this.game_.start();
  this.run();
};

GameRunner.prototype.run = function() {
  if (this.running_) return;
  this.running_ = true;
  this.requestNextStep_();
};

GameRunner.prototype.stop = function() {
  if (!this.running_) return;
  this.cancelAnimationFrame_(this.frameRequest_);
  this.running_ = false;
};

GameRunner.prototype.step_ = function() {
  var now = Date.now();
  var dt = (now - this.frameRequestTime_) / 1000;
  dt = Math.min(dt, GameRunner.MIN_DT) * this.gm_.gameSpeed;
  this.update_(dt);
  this.requestNextStep_();
};

GameRunner.prototype.requestNextStep_ = function() {
  if (!this.running_) return;
  this.frameRequestTime_ = Date.now();
  this.frameRequest_ = this.requestAnimationFrame_(this.boundStep_);
};

GameRunner.prototype.update_ = function(dt) {
  this.game_.update(dt);
  this.mouse_.clearInput();
  this.renderer_.update(dt);
};
