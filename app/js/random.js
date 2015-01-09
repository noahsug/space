var Random = di.service('Random');

Random.prototype.init = function() {
  _.class.extend(this, new SeededRandom());
};
