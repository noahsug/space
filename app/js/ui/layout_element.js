var LayoutElement = di.factory('LayoutElement', [
  'Screen', 'UiElement']);

LayoutElement.prototype.init = function(opt_options) {
  _.class.extend(this, this.uiElement_.create());

  this.elements_ = [];
  this.oriented_ = {};
  this.oriented_.padding = {};
  this.maxHeight_ = 0;
  this.maxWidth_ = 0;

  var options = opt_options || {};
  this.setDirection(options.direction || LayoutElement.Direction.HORIZONTAL);
  this.setAlign(options.align || LayoutElement.Align.CENTER);
  this.setPadding.apply(this, options.padding || [0]);
};

LayoutElement.Direction = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
};

LayoutElement.Align = {
  LEFT: 'left',
  TOP: 'left',
  RIGHT: 'right',
  BOTTOM: 'right',
  CENTER: 'center'
};

LayoutElement.prototype.setDirection = function(direction) {
  this.direction_ = direction;
  if (direction == LayoutElement.Direction.HORIZONTAL) {
    this.oriented_.padding.top = this.padding.top;
    this.oriented_.padding.right = this.padding.right;
    this.oriented_.padding.bottom = this.padding.bottom;
    this.oriented_.padding.left = this.padding.left;
    this.oriented_.height = 'height';
    this.oriented_.width = 'width';
    this.oriented_.maxHeight_ = 'maxHeight_';
    this.oriented_.maxWidth_ = 'maxWidth_';
    this.oriented_.x = 'x';
    this.oriented_.y = 'y';
  } else if (direction == LayoutElement.Direction.VERTICAL) {
    this.oriented_.padding.top = this.padding.right;
    this.oriented_.padding.right = this.padding.bottom;
    this.oriented_.padding.bottom = this.padding.left;
    this.oriented_.padding.left = this.padding.top;
    this.oriented_.height = 'width';
    this.oriented_.width = 'height';
    this.oriented_.maxHeight_ = 'maxWidth_';
    this.oriented_.maxWidth_ = 'maxHeight_';
    this.oriented_.x = 'y';
    this.oriented_.y = 'x';
  } else {
    _.fail('invalid direction: ' + direction);
  }
};

LayoutElement.prototype.setAlign = function(align) {
  this.align_ = align;
};

LayoutElement.prototype.add = function(element, opt_options) {
  this.elements_.push(element);
  if (!opt_options) return;
  if (_.isDef(opt_options.flex)) element.layout.flex = opt_options.flex;
  if (_.isDef(opt_options.align)) element.layout.align = opt_options.align;
  if (_.isDef(opt_options.padding)) {
    element.setPadding.apply(element, opt_options.padding);
  }
};

LayoutElement.prototype.positionChild_ = function(x, y) {
  if (this.align_ == 'top') this.align_ = 'left';
  if (this.align_ == 'bottom') this.align_ = 'right';

  var o = this.oriented_;
  if (this.direction_ == LayoutElement.Direction.VERTICAL) {
    var temp = x;
    x = y;
    y = temp;
  }
  var freeWidth = this[o.maxWidth_] || this.screen_[o.width];
  var totalFlex = 0;
  for (var i = 0; i < this.elements_.length; i++) {
    var e = this.elements_[i];
    if (!e.layout.flex) {
      e.calcSize_();
      freeWidth -= e[o.width];
    }
    else totalFlex += e.layout.flex;
  }

  var distance = x;
  if (totalFlex == 0) {
    if (this.align_ == LayoutElement.Align.CENTER) {
      distance += freeWidth / 2;
    } else if (this.align_ == LayoutElement.Align.RIGHT) {
      distance += freeWidth;
    }
    for (var i = 0; i < this.elements_.length; i++) {
      var e = this.elements_[i];
      this.orientedSetPosition_(e, distance, y);
      distance += e[o.width];
      e.update();
    }

  } else {
    for (var i = 0; i < this.elements_.length; i++) {
      var e = this.elements_[i];
      if (e.layout.flex) {
        var align = e.layout.align || this.align_;
        e[o.maxWidth_] = freeWidth * e.layout.flex / totalFlex;
        if (align == LayoutElement.Align.LEFT) {
          this.orientedSetPosition_(e, distance, y);
        } else if (align == LayoutElement.Align.CENTER) {
          this.orientedSetPosition_(e, distance + e[o.maxWidth_] / 2, y);
        } else {
          this.orientedSetPosition_(e, distance + e[o.maxWidth_], y);
        }
        distance += e[o.maxWidth_];
      } else {
        this.orientedSetPosition_(e, distance, y);
        distance += e[o.width];
      }
      e.update();
    }
  }
};

LayoutElement.prototype.orientedSetPosition_ = function(e, x, y) {
  if (this.direction_ == LayoutElement.Direction.HORIZONTAL) {
    e.setPos(x, y);
  } else {
    e.setPos(y, x);
  }
};
