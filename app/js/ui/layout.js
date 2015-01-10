var Layout = di.factory('Layout', [
  'Screen', 'UiElement']);

Layout.prototype.init = function() {
  _.class.extend(this, this.uiElement_.create());

  this.oriented_ = {};
  this.oriented_.padding = {};

  this.maxHeight_ = 0;
  this.maxWidth_ = 0;

  this.layout.align = Layout.Align.LEFT;

  this.elements_ = [];
  this.setDirection(Layout.Direction.HORIZONTAL);
  this.setAlign(Layout.Align.CENTER);
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

Layout.prototype.setAlign = function(align) {
  this.align_ = align;
};

Layout.prototype.add = function(element) {
  this.elements_.push(element);
};

Layout.prototype.positionChild_ = function(x, y) {
  var length = this.maxWidth_ || this.screen_.width;
  var freeLength = length;
  var totalFlex = 0;
  for (var i = 0; i < this.elements_.length; i++) {
    var e = this.elements_[i];
    if (!e.layout.flex) {
      e.calcSize_();
      freeLength -= e.width;
    }
    else totalFlex += e.layout.flex;
  }

  var distance = x;
  if (totalFlex == 0) {
    if (this.align_ == Layout.Align.CENTER) {
      distance += freeLength / 2;
    } else if (this.align_ == Layout.Align.RIGHT) {
      distance += freeLength;
    }
    for (var i = 0; i < this.elements_.length; i++) {
      var e = this.elements_[i];
      e.setPos(distance, y);
      distance += e.width;
      e.update();
    }

  } else {
    for (var i = 0; i < this.elements_.length; i++) {
      var e = this.elements_[i];
      if (e.layout.flex) {
        var align = e.layout.align || this.align_;
        e.maxWidth_ = freeLength * e.layout.flex / totalFlex;
        if (align == Layout.Align.LEFT) {
          e.setPos(distance, y);
        } else if (align == Layout.Align.CENTER) {
          e.setPos(distance + e.maxWidth_ / 2, y);
        } else {
          e.setPos(distance + e.maxWidth_, y);
        }
        distance += e.maxWidth_;
      } else {
        e.setPos(distance, y);
        distance += e.width;
      }
      e.update();
    }
  }
};
