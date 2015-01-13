var EntityElement = di.factory('EntityElement', [
  'Entity', 'EntityDecorator', 'GameModel as gm', 'Screen', 'UiElement']);

EntityElement.prototype.init = function(type) {
  _.class.extend(this, this.uiElement_.create());
  this.d_ = this.entityDecorator_.getDecorators();

  this.entity_ = this.entity_.create(type);
  _.decorate(this.entity_, this.d_.staticPosition);
  this.gm_.entities.add(this.entity_);
};

EntityElement.prototype.getEntity = function() {
  return this.entity_;
};

EntityElement.prototype.setStyle = function(style) {
  this.entity_.style = style;
};

EntityElement.prototype.positionChild_ = function(x, y) {
  this.entity_.setPos(x, y);
};

EntityElement.prototype.onClickFn_ = _.emptyFn;

EntityElement.prototype.onClick = function(fn) {
  this.onClickFn_ = fn;
};

EntityElement.prototype.update_ = function() {
  if (this.entity_.clicked && !this.entity_.locked) {
    this.onClickFn_(this);
  }
};
