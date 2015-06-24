var EntityElement = di.factory('EntityElement', [
  'Entity', 'EntityDecorator', 'GameModel as gm', 'Screen', 'Mouse',
  'UiElement']);

EntityElement.prototype.init = function(type) {
  di.extend(this, this.UiElement_);
  this.d_ = this.entityDecorator_.getDecorators();
  this.entity_ = this.createEntity_(type);
  this.entity_.alpha = 1;
};

EntityElement.prototype.createEntity_ = function(type) {
  var entity = this.Entity_.new(type);
  _.decorate(entity, this.d_.staticPosition);
  this.gm_.entities.add(entity);
  return entity;
};

EntityElement.prototype.setAlpha = function(alpha) {
  this.entity_.alpha = alpha;
  return this;
};

EntityElement.prototype.setStyle = function(style) {
  this.entity_.style = style;
  return this;
};

EntityElement.prototype.getStyle = function() {
  return this.entity_.style;
};

EntityElement.prototype.setBgStyle = function(bgStyle) {
  this.entity_.bgStyle = bgStyle;
  return this;
};

EntityElement.prototype.setBorderStyle = function(borderStyle) {
  this.entity_.borderStyle = borderStyle;
  return this;
};

EntityElement.prototype.setProp = function(prop, value) {
  this.entity_[prop] = value;
  return this;
};

EntityElement.prototype.getProp = function(prop) {
  return this.entity_[prop];
};

EntityElement.prototype.getEntity = function() {
  return this.entity_;
};

EntityElement.prototype.positionChild_ = function(x, y) {
  this.entity_.setPos(x, y);
};

EntityElement.prototype.collides_ = function(point) {
  if (this.entity_.locked) return false;
  return this.base_.collides_.call(this, point);
};
