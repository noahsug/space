var BtnElement = di.factory('BtnElement', [
  'Font', 'LabelElement']);

BtnElement.prototype.init = function() {
  _.class.extend(this, this.labelElement_.create());
  this.entity_.type = 'btn';
  _.decorate(this.entity_, this.d_.clickable);
};

BtnElement.prototype.setText = function(text, spec) {
  if (spec && (spec.align || spec.baseline)) {
    _.fail('cannot specifiy align or baseline for buttons');
  }
  this.base_.setText(text, spec);
  this.entity_.align = 'left';
  this.entity_.baseline = 'top';
};
