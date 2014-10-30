var Random = di.service('Random');

Random.prototype.init = function() {
  this.seed();
};

Random.prototype.seed = function() {
  this.seed_ = _.pseudorandomSeed();
};

Random.prototype.getSeed = function() {
  return this.seed_;
};

Random.prototype.next = function() {
  var r = _.pseudorandom(this.seed_);
  this.seed_ = _.pseudorandomSeed(this.seed_);
  return r;
};

Random.prototype.nextInt = function(minOrMax, opt_max) {
  var max = opt_max;
  var min = minOrMax;
  if (!_.isDef(max)) {
    max = minOrMax;
    min = 0;
  }
  return Math.floor(this.next() * (max - min + 1) + min);
};
