var LayoutElement = di.factory('LayoutElement', [
  'Screen', 'UiElement']);

LayoutElement.prototype.init = function(opt_options) {
  _.class.extend(this, this.uiElement_.create());

  this.elements_ = [];
  this.oriented_ = {};
  this.oriented_.padding = {};
  this.maxHeight_ = null;  // null means screen height.
  this.maxWidth_ = null;  // null means screen width.

  var options = opt_options || {};
  this.setDirection(options.direction || LayoutElement.Direction.HORIZONTAL);
  this.setAlign(options.align || LayoutElement.Align.CENTER);
  this.setPadding.apply(this, options.padding || [0]);

  this.addUnit_('pad-left', 'btn', .66);
  this.addUnit_('pad-bot', 'btn', .16);
  this.addUnit_('pad-left', 'btn-lg', .6);
  this.addUnit_('pad-top', 'btn-lg', .2);
};

LayoutElement.Direction = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
};

LayoutElement.Align = {
  LEFT: 'left',
  TOP: 'top',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  CENTER: 'center'
};

LayoutElement.prototype.setDirection = function(direction) {
  this.direction_ = direction;
  this.oriented_.center = 'center';
  if (direction == LayoutElement.Direction.HORIZONTAL) {
    this.oriented_.top = 'top';
    this.oriented_.right = 'right';
    this.oriented_.bottom = 'bottom';
    this.oriented_.left = 'left';
    this.oriented_.height = 'height';
    this.oriented_.width = 'width';
    this.oriented_.maxHeight_ = 'maxHeight_';
    this.oriented_.maxWidth_ = 'maxWidth_';
    this.oriented_.x = 'x';
    this.oriented_.y = 'y';
  } else if (direction == LayoutElement.Direction.VERTICAL) {
    this.oriented_.top = 'right';
    this.oriented_.right = 'bottom';
    this.oriented_.bottom = 'left';
    this.oriented_.left = 'top';
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
  var o = this.oriented_;
  if (this.direction_ == LayoutElement.Direction.VERTICAL) {
    var temp = x; x = y; y = temp;  // Swap x and y.
  }
  var maxWidth = this[o.maxWidth_] || this.screen_[o.width];
  var freeWidth =
      maxWidth - this.calc_.padding[o.left] - this.calc_.padding[o.right];
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
    if (this.align_ == o.center) {
      distance += freeWidth / 2;
    } else if (this.align_ == o.right) {
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
        if (align == o.left) {
          this.orientedSetPosition_(e, distance, y);
        } else if (align == o.center) {
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
