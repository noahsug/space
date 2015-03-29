var LabelElement = di.factory('LabelElement', [
  'Font', 'EntityElement']);

LabelElement.prototype.init = function() {
  _.class.extend(this, this.entityElement_.create('label'));

  this.addUnit_('size', 'btn', 16);
  this.addUnit_('size', 'btn-lg', 20);
  this.addUnit_('size', 'btn-sm', 12);
};

LabelElement.prototype.setText = function(text, spec) {
  spec.text = text;
  spec.size = this.measure_('size', spec.size);
  _.decorate(this.entity_, this.d_.shape.text, spec);
};

LabelElement.prototype.calcChildWidthHeight_ = function() {
  this.childWidth = this.font_.width(this.entity_.text, this.entity_.size);
  this.childHeight = this.entity_.size;
};
