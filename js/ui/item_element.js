var ItemElement = di.factory('ItemElement', ['EntityElement']);

ItemElement.prototype.init = function(direction) {
  di.extend(this, this.EntityElement_, 'item');
};

ItemElement.prototype.setSize = function(size) {
  this.innerWidth = this.innerHeight = this.entity_.size = size;
  return this;
};
