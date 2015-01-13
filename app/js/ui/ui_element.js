var UiElement = di.factory('UiElement', [
  'Entity', 'EntityDecorator', 'Screen']);

UiElement.prototype.init = function(opt_options) {
  this.layout = {};
  this.padding = {};
  this.setPadding(0);
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;
  this.childWidth_ = 0;
  this.childHeight_ = 0;

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
  this.calc_.padding.left = this.measure_(this.padding.left, 'width');
  this.calc_.padding.right = this.measure_(this.padding.right, 'width');
  this.calc_.padding.top = this.measure_(this.padding.top, 'height');
  this.calc_.padding.bottom = this.measure_(this.padding.bottom, 'height');
};

UiElement.prototype.measure_ = function(value, dimension) {
  if (value < 1) return value * this.screen_[dimension];
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
  this.positionChild_(this.x + this.calc_.padding.left,
                      this.y + this.calc_.padding.top);
};

UiElement.prototype.positionChild_ = _.emptyFn;

UiElement.prototype.update_ = _.emptyFn;
