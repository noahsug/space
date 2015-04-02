var RoundBtnElement = di.factory('RoundBtnElement', [
  'Font', 'LabelElement', 'EntityElement', 'Screen']);

RoundBtnElement.prototype.init = function() {
  _.class.extend(this, this.entityElement_.create('roundBtn'));
  _.decorate(this.entity_, this.d_.clickable);
  _.decorate(this.entity_, this.d_.shape.circle, {radius: 20});

  this.addUnit_('size', 'world', 90);
  this.addUnit_('size', 'item', 90);
  this.addUnit_('size', 'level', 60);
};

RoundBtnElement.prototype.setSize = function(size) {
  this.entity_.radius = this.measure_('size', size) / 2;
};

RoundBtnElement.prototype.calcChildWidthHeight_ = function() {
  this.childWidth = this.childHeight = this.entity_.radius * 2;
};
