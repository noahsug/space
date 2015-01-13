var BtnSm = di.factory('BtnSm', [
  'Entity', 'EntityDecorator', 'GameModel as gm', 'Screen']);

BtnSm.prototype.init = function(name) {
  this.d_ = this.entityDecorator_.getDecorators();
  this.onClick_ = _.emptyFn;

  this.base = this.entity_.create('btnSm');
  this.base.name = name;
  _.decorate(this.base, this.d_.shape.circle, {radius: 20});
  _.decorate(this.base, this.d_.clickable);
  _.decorate(this.base, this.d_.staticPosition);
  this.gm_.entities.add(this.base);

  this.updateSize_();
  this.setPos = this.base.setPos.bind(this.base);
};

BtnSm.prototype.markAsLocked = function() {
  this.base.locked = true;
};

// TODO: NOT USED.
BtnSm.prototype.place = function(place) {
  this.place_ = place;
};

BtnSm.prototype.navButton = function() {
  this.base.radius = 16;
  this.base.fontSize = 16;
  this.updateSize_();
  this.orientation_ = _.pos.BOTTOM;
};

BtnSm.prototype.updateSize_ = function() {
  this.width = this.height = this.base.radius * 2;
};

BtnSm.prototype.onClick = function(fn) {
  this.onClick_ = fn;
};

BtnSm.prototype.update = function() {
  if (this.base.clicked && !this.base.locked) {
    this.onClick_(this);
  }

  if (this.orientation_ == _.pos.BOTTOM) {
    this.setPos(0, this.screen_.height / 2 - 16 - 10);
  }
};
