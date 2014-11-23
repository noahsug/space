var Random = di.service('Random');

Random.prototype.init = function() {
  this.rand_ = new SeededRandom();
  _.class.extend(this, this.rand_);
};
