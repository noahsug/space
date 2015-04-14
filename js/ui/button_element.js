var BtnElement = di.factory('BtnElement', [
  'LabelElement', 'EntityElement', 'Screen']);

var HITBOX_WIDTH = 400;
BtnElement.prototype.init = function() {
  _.class.extend(this, this.entityElement_.create('hitbox'));
  _.decorate(this.entity_, this.d_.clickable);
  _.decorate(this.entity_, this.d_.shape.rect, {width: HITBOX_WIDTH});

  this.label_ = this.labelElement_.create();
  this.label_.setType('btn');
  ['setStyle', 'getStyle', 'setProp', 'getProp'].forEach(function(name) {
    this[name] = this.label_[name].bind(this.label_);
  }, this);

  this.setLineDirection('right');

  this.addUnit_('pad-bot', 'btn', 25);
  this.addUnit_('pad-bot', 'btn-lg', 30);
  this.addUnit_('pad-left', 'btn-mix', .1);
  this.addUnit_('pad-right', 'btn-mix', .1);

  this.addUnit_('pad-left', 'btn-sm', .75);
};

BtnElement.prototype.setLineDirection = function(direction) {
  this.label_.entity_.lineDirection = direction;
};

BtnElement.prototype.setText = function(text, spec) {
  spec = spec || {};
  if (spec.align || spec.baseline) {
    _.fail('cannot specifiy align or baseline for buttons');
  }
  spec.align = 'left';
  spec.baseline = 'top';
  this.label_.setText(text, spec);

  this.entity_.height = spec.size + 4;
};

BtnElement.prototype.setWidth = function(width) {
  this.width_ = width;
};

BtnElement.prototype.calcChildWidthHeight_ = function() {
  this.label_.update();
  this.childWidth = this.width_ || this.label_.childWidth;
  this.childHeight = this.label_.childHeight;
};

BtnElement.prototype.positionChild_ = function(x, y) {
  this.label_.setPos(x, y);
  if (this.label_.entity_.lineDirection == 'left') {
    x -= HITBOX_WIDTH - this.childWidth;
  }
  this.entity_.setPos(x, y);
};
