var LabelElement = di.factory('LabelElement', [
  'Font', 'EntityElement']);

LabelElement.prototype.init = function() {
  _.class.extend(this, this.entityElement_.create('label'));
};

LabelElement.prototype.setText = function(text, spec) {
  spec.text = text;
  _.decorate(this.entity_, this.d_.shape.text, spec);
};

LabelElement.prototype.calcChildWidthHeight_ = function() {
  this.childWidth_ = this.font_.width(this.entity_.text, this.entity_.size);
  this.childHeight_ = this.entity_.size;
};
