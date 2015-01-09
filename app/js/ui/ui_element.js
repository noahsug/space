var UiElement = di.factory('UiElement', [
  'Entity', 'EntityDecorator', 'Screen']);

UiElement.prototype.init = function(name) {
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
  this.padding.rawTop = top;
  this.padding.rawRight = right;
  this.padding.rawLeft = left;
  this.padding.rawBottom = bottom;
  this.resize();
};

UiElement.prototype.setPos = function(x, y) {
  this.x = x;
  this.y = y;
  this.updateChildPosition_();
};

UiElement.prototype.resize = function() {
  this.calcPadding_();
  this.calcChildWidth_();
  this.calcChildHeight_();
  this.calcWidth_();
  this.calcHeight_();
  this.updateChildPosition_();
};

UiElement.prototype.updateChildPosition_ = function() {
  this.positionChild_(this.x + this.padding.left, this.y + this.padding.top);
};

UiElement.prototype.calcPadding_ = function() {
  this.padding.left = this.measure_(this.padding.rawLeft);
  this.padding.right = this.measure_(this.padding.rawRight);
  this.padding.top = this.measure_(this.padding.rawTop);
  this.padding.bottom = this.measure_(this.padding.rawBottom);
};

UiElement.prototype.calcChildWidth_ = _.EMPTY_FN;

UiElement.prototype.calcChildHeight_ = _.EMPTY_FN;

UiElement.prototype.calcWidth_ = function() {
  this.width =
      this.measure_(this.padding.left, 'width') +
      this.childWidth_ +
      this.measure_(this.padding.right, 'width');
};

UiElement.prototype.calcHeight_ = function() {
  this.height =
      this.measure_(this.padding.left, 'height') +
      this.childHeight_ +
      this.measure_(this.padding.right, 'height');
};

UiElement.prototype.positionChild_ = _.EMPTY_FN;

UiElement.prototype.measure_ = function(size, dimension) {
  if (_.isString(size)) return parseInt(size) * this.screen_[dimension];
  return size;
};
