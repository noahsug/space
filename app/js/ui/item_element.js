var ItemElement = di.factory('ItemElement', ['EntityElement']);

ItemElement.prototype.init = function(direction) {
  _.class.extend(this, this.EntityElement_.new('item'));
};

ItemElement.prototype.setSize = function(size) {
  this.innerWidth = this.innerHeight = this.entity_.size = size;
  return this;
};
