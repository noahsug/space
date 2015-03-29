var EntityElement = di.factory('EntityElement', [
  'Entity as entityFactory', 'EntityDecorator', 'GameModel as gm', 'Screen',
  'UiElement']);

EntityElement.prototype.init = function(type) {
  _.class.extend(this, this.uiElement_.create());
  this.d_ = this.entityDecorator_.getDecorators();
  this.entity_ = this.createEntity_(type);
};

EntityElement.prototype.setType = function(type) {
  this.entity_.type = type;
};

EntityElement.prototype.createEntity_ = function(type) {
  var entity = this.entityFactory_.create(type);
  _.decorate(entity, this.d_.staticPosition);
  this.gm_.entities.add(entity);
  return entity;
};

EntityElement.prototype.setStyle = function(style) {
  this.setProp('style', style);
};

EntityElement.prototype.getStyle = function() {
  return this.getProp('style');
};

EntityElement.prototype.setProp = function(prop, value) {
  this.entity_[prop] = value;
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

EntityElement.prototype.onClickFn_ = _.emptyFn;

EntityElement.prototype.onClick = function(fn) {
  this.onClickFn_ = fn;
};

EntityElement.prototype.update_ = function() {
  if (this.entity_.clicked && !this.entity_.locked) {
    this.onClickFn_(this);
    this.entity_.clicked = false;
  }
};
