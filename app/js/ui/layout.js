var Layout = di.factory('Layout', [
  'Screen', 'UiElement']);

Layout.prototype.init = function() {
  _.class.extend(this, this.uiElement_.create());

  this.elements_ = [];
  this.setDirection(Layout.Direction.HORIZONTAL);
  this.setAlign(Layout.Align.LEFT);

  this.oriented_ = {};
  this.oriented_.padding = {};
};

Layout.Direction = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
};

Layout.Align = {
  LEFT: 'left',
  TOP: 'left',
  RIGHT: 'right',
  BOTTOM: 'right',
  CENTER: 'center'
};

Layout.prototype.setAlign = function(align) {
  this.align_ = align;
};

Layout.prototype.setDirection = function(direction) {
  if (direction == Layout.Direction.HORIZONTAL) {
    this.oriented_.padding.top = this.padding.top;
    this.oriented_.padding.right = this.padding.right;
    this.oriented_.padding.bottom = this.padding.bottom;
    this.oriented_.padding.left = this.padding.left;
    this.oriented_.height = 'height';
    this.oriented_.width = 'width';
    this.oriented_.x = 'x';
    this.oriented_.y = 'y';
  } else {
    this.oriented_.padding.top = this.padding.right;
    this.oriented_.padding.right = this.padding.bottom;
    this.oriented_.padding.bottom = this.padding.left;
    this.oriented_.padding.left = this.padding.top;
    this.oriented_.height = 'width';
    this.oriented_.width = 'height';
    this.oriented_.x = 'y';
    this.oriented_.y = 'x';
  }
};

Layout.prototype.addElement = function(element) {
  this.elements_.push(element);
  element.flex = element.flex || 0;
};

Layout.prototype.layoutElements = function() {

};
