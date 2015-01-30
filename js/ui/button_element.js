var BtnElement = di.factory('BtnElement', [
  'Font', 'LabelElement', 'EntityElement', 'Screen']);

BtnElement.prototype.init = function() {
  _.class.extend(this, this.entityElement_.create('hitbox'));
  _.decorate(this.entity_, this.d_.clickable);
  _.decorate(this.entity_, this.d_.shape.rect, {width: this.screen_.width});

  this.label_ = this.labelElement_.create();
  this.label_.setType('btn');

  this.addUnit_('pad-bot', 'btn', 25);
  this.addUnit_('pad-bot', 'btn-lg', 30);
  this.addUnit_('pad-left', 'btn-mix', .1);
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

BtnElement.prototype.setStyle = function(style) {
  this.label_.setStyle(style);
};

BtnElement.prototype.calcChildWidthHeight_ = function() {
  this.label_.update();
  this.childWidth_ = this.label_.childWidth_;
  this.childHeight_ = this.label_.childHeight_;
};

BtnElement.prototype.positionChild_ = function(x, y) {
  this.label_.setPos(x, y);
  this.entity_.setPos(x, y);
};
