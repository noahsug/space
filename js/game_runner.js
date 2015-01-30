var GameRunner = di.service('GameRunner', [
  'Game', 'Mouse', 'Renderer', 'requestAnimationFrame',
  'cancelAnimationFrame', 'GameModel as gm']);

GameRunner.MIN_FPS = 15;

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
  this.running_ = true;
  this.requestNextStep_();
};

GameRunner.prototype.stop = function() {
  this.cancelAnimationFrame_(this.frameRequest_);
  this.running_ = false;
};

window.time = 0; // DEBUG
var minDt = 1 / GameRunner.MIN_FPS;
GameRunner.prototype.step_ = function() {
  var now = Date.now();
  var dt = (now - this.frameRequestTime_) / 1000;

  // DEBUG
  //time += dt;
  //var r = time > 1 ? .1 : 10;
  //r = time > 1.5 ? 1 : 10;
  //r = 1;
  //window.debug = time > 1.5;

  dt = Math.min(dt, minDt) * this.gm_.gameSpeed;
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
  this.renderer_.update(dt);
  this.mouse_.clearInput();
};
