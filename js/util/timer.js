var Timer = function(opt_totalTime) {
  this.time = 0;
  this.started = false;

  if (_.isDef(opt_totalTime)) this.start(opt_totalTime);
};

Timer.prototype.start = function(totalTime) {
  this.time = totalTime;
  this.started = true;
};

Timer.prototype.tick =  function(dt) {
  if (!this.started) return false;
  this.time -= dt;
  if (this.time <= 0) {
    this.started = false;
    return true;
  }
  return false;
};

_.timer = function() { return new Timer(); };
