var UiElement = di.factory('UiElement', [
  'Entity', 'EntityDecorator', 'Screen']);

UiElement.prototype.init = function() {
  this.layout = {align: 'center'};
  this.padding = {};
  this.align = 'none';  // Not used.
  this.baseline = 'none';  // Not used.
  this.setPadding(0);
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;
  this.childWidth_ = 0;
  this.childHeight_ = 0;
  this.units_ = {};

  this.calc_ = {};  // Store calculated values.
  this.calc_.padding = {};
};

UiElement.prototype.setPadding = function(top, right, bottom, left) {
  if (arguments.length == 1) {
    right = bottom = left = top;
  }
  if (arguments.length == 2) {
    bottom = top;
    left = right;
  }
  if (arguments.length == 3) {
    left = right;
  }
  this.padding.top = top;
  this.padding.right = right;
  this.padding.left = left;
  this.padding.bottom = bottom;
};

UiElement.prototype.addUnit_ = function(type, unit, value) {
  this.units_[type] = this.units_[type] || {};
  this.units_[type][unit] = value;
};

UiElement.prototype.setPos = function(x, y) {
  this.x = x;
  this.y = y;
  this.updateChildPosition_();
};

UiElement.prototype.update = function() {
  this.calcSize_();
  this.updateChildPosition_();
  this.update_();
};

UiElement.prototype.calcSize_ = function() {
  this.calcPadding_();
  this.calcChildWidthHeight_();
  this.calcWidthHeight_();
};

UiElement.prototype.calcPadding_ = function() {
  this.calc_.padding.left = this.measure_('pad-left', this.padding.left);
  this.calc_.padding.right = this.measure_('pad-right', this.padding.right);
  this.calc_.padding.top = this.measure_('pad-top', this.padding.top);
  this.calc_.padding.bottom = this.measure_('pad-bot', this.padding.bottom);
};

UiElement.prototype.measure_ = function(type, value) {
  value = (this.units_[type] && this.units_[type][value]) || value;
  if (value < 1) {
    var dimension = ((type == 'pad-left' || type == 'pad-right') && 'width') ||
        'height';
    return value * this.screen_[dimension];
  }
  _.assert(!isNaN(value), 'invalid ' + type + ': ' + value);
  return value;
};

UiElement.prototype.calcChildWidthHeight_ = _.emptyFn;

UiElement.prototype.calcWidthHeight_ = function() {
  this.width =
      this.calc_.padding.left + this.childWidth_ + this.calc_.padding.right;
  this.height =
      this.calc_.padding.top + this.childHeight_ + this.calc_.padding.bottom;
};

UiElement.prototype.updateChildPosition_ = function() {
  //var x = this.x;
  //if (this.align == 'left') {
  //  x += this.calc_.padding.left;
  //} else if (this.align == 'right') {
  //  x += this.width - this.calc_.padding.right;
  //} else {
  //  x += this.calc_.padding.left + this.childWidth_ / 2;
  //}
  //var y = this.y;
  //if (this.baseline == 'top') {
  //  y += this.calc_.padding.top;
  //} else if (this.baseline == 'bottom') {
  //  y += this.height - this.calc_.padding.bottom;
  //} else {
  //  y += this.calc_.padding.top + this.childHeight_ / 2;
  //}
  this.positionChild_(this.calc_.padding.left + this.x,
                      this.calc_.padding.top + this.y);
};

UiElement.prototype.positionChild_ = _.emptyFn;

UiElement.prototype.update_ = _.emptyFn;
