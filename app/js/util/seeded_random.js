var SeededRandom = function(opt_seed) {
  this.seed();
  this.seedIncrement_ = .1379;
};

SeededRandom.prototype.seed = function(opt_seed, opt_increment) {
  this.seed_ = _.isDef(opt_seed) ? opt_seed : _.pseudorandomSeed();
  if (opt_increment) this.seedIncrement_ = opt_increment;
};

SeededRandom.prototype.getSeed = function() {
  return this.seed_;
};

SeededRandom.prototype.next = function() {
  var r = _.pseudorandom(this.seed_);
  this.seed_ += this.seedIncrement_;
  return r;
};

SeededRandom.prototype.nextInt = function(minOrMax, opt_max) {
  var max = opt_max;
  var min = minOrMax;
  if (!_.isDef(max)) {
    max = minOrMax;
    min = 0;
  }
  return Math.floor(this.next() * (max - min + 1) + min);
};