var UiElement = di.factory('UiElement', [
  'Entity', 'EntityDecorator', 'Screen']);

UiElement.prototype.init = function(name) {
  this.layout = {};
  this.padding = {};
  this.setPadding(0);
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;
  this.childWidth_ = 0;
  this.childHeight_ = 0;
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
  this.calcChildWidthHeight_();
  this.calcWidthHeight_();
};

UiElement.prototype.update_ = _.EMPTY_FN;

UiElement.prototype.calcChildWidthHeight_ = _.EMPTY_FN;

UiElement.prototype.calcWidthHeight_ = function() {
  this.width = this.padding.left + this.childWidth_ + this.padding.right;
  this.height = this.padding.top + this.childHeight_ + this.padding.bottom;
};

UiElement.prototype.updateChildPosition_ = function() {
  this.positionChild_(this.x + this.padding.left, this.y + this.padding.top);
};

UiElement.prototype.positionChild_ = _.EMPTY_FN;
