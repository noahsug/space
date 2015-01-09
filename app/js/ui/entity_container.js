var EntityContainer = di.factory('EntityContainer', [
  'Entity', 'EntityDecorator', 'GameModel as gm', 'Screen', 'UiElement']);

EntityContainer.prototype.init = function() {
  _.class.extend(this, this.uiElement_.create());
  this.d_ = this.entityDecorator_.getDecorators();
};

EntityContainer.prototype.addEntity = function(type) {
  this.entity_ = this.entity_.create('label');
  _.decorate(this.entity_, this.d_.staticPosition);
  this.gm_.entities.add(this.entity_);
  return this.entity_;
};

EntityContainer.prototype.positionChild_ = function(x, y) {
  this.entity_.setPos(x, y);
};

EntityContainer.prototype.onClick = function(fn) {
  this.onClick_ = fn;
};

EntityContainer.prototype.update = function() {
  if (this.entity_.clicked && !this.entity_.locked) {
    this.onClick_(this);
  }
};
