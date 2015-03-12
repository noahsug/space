var RoundBtnElement = di.factory('RoundBtnElement', [
  'Font', 'LabelElement', 'EntityElement', 'Screen']);

RoundBtnElement.prototype.init = function() {
  _.class.extend(this, this.entityElement_.create('roundBtn'));
  _.decorate(this.entity_, this.d_.clickable);
  _.decorate(this.entity_, this.d_.shape.circle, {radius: 20});
};

RoundBtnElement.prototype.setSize = function(size) {
  this.entity_.radius = size / 2;
};

RoundBtnElement.prototype.calcChildWidthHeight_ = function() {
  this.childWidth_ = this.childHeight_ = this.entity_.radius * 2;
};
