var StageElement = di.factory('StageElement', ['EntityElement']);

StageElement.prototype.init = function() {
  di.extend(this, this.EntityElement_, 'stage');
  this.setSize(Size.STAGE);
};

StageElement.Progress = {'locked': 0, 'unlocked': 1, 'won': 2};

StageElement.prototype.setProgress = function(progress) {
  this.entity_.progress = progress;
};

StageElement.prototype.setSize = function(size) {
  this.innerWidth = this.innerHeight = this.entity_.size = size;
  return this;
};
