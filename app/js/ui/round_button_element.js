var RoundBtnElement = di.factory('RoundBtnElement', [
  'TextService', 'LabelElement', 'EntityElement', 'Screen']);

RoundBtnElement.prototype.init = function() {
  _.class.extend(this, this.EntityElement_.new('roundBtn'));
  _.decorate(this.entity_, this.d_.clickable);
  _.decorate(this.entity_, this.d_.shape.circle, {radius: 20});
};

RoundBtnElement.prototype.setSize = function(size) {
  this.entity_.radius = this.measure_('size', size) / 2;
};

RoundBtnElement.prototype.getSize = function() {
  return this.entity_.radius * 2;
};

RoundBtnElement.prototype.calcInnerWidthHeight_ = function() {
  this.innerWidth = this.innerHeight = this.entity_.radius * 2;
};
