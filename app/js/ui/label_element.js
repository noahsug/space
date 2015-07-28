var LabelElement = di.factory('LabelElement', [
  'EntityElement', 'TextService']);

LabelElement.prototype.init = function() {
  di.extend(this, this.EntityElement_, 'label');
  this.hitboxMargin_ = 13;
};

LabelElement.prototype.setText = function(text, size, opt_spec) {
  var spec = opt_spec || {};
  this.entity_.text = text.toUpperCase();
  this.entity_.lines = [this.entity_.text];
  if (_.isDef(size)) this.entity_.size = this.measure_('size', size);
  if (spec.align) this.align = spec.align;
  if (spec.baseline) this.baseline = spec.baseline;
  if (spec.style) this.setStyle(spec.style);
  if (spec.bgStyle) this.setBgStyle(spec.bgStyle);

  this.calcInnerWidthHeight_();
  return this;
};

// When enabled, reports a width of 0, since width is flexible.
LabelElement.prototype.setLineWrap = function(lineWrap) {
  this.lineWrap_ = lineWrap;
  return this;
};

LabelElement.prototype.setNumLines = function(numLines) {
  this.numLines_ = numLines;
  return this;
};

LabelElement.prototype.setBg = function(style, padding) {
  this.setBgStyle(style);
  this.setPadding(padding);
  return this;
};

LabelElement.prototype.calcInnerWidthHeight_ = function() {
  this.prevText_ = this.entity_.text;
  if (this.lineWrap_) this.calcWrappedInnerWidth_();
  else this.calcNoWrapInnerWidth_();

  var fontHeight = this.textService_.height(this.entity_.size);
  var linePadding = fontHeight / 2;
  this.entity_.lineHeight = fontHeight + linePadding;
  var numLines = this.numLines_ || this.entity_.lines.length;
  this.entity_.height = numLines * this.entity_.lineHeight - linePadding;
  this.innerHeight = this.entity_.height;

  this.entity_.bgMargin = this.padding;
};

LabelElement.prototype.calcWrappedInnerWidth_ = function() {
  this.entity_.width = this.calcFreeWidth();
  this.entity_.lines = this.textService_.wrap(
      this.entity_.text, this.entity_.size, this.calcFreeWidth());
  this.innerWidth = 0;
};

LabelElement.prototype.calcNoWrapInnerWidth_ = function() {
  this.entity_.width = this.textService_.width(
      this.entity_.text, this.entity_.size);
  this.innerWidth = this.entity_.width;
};
