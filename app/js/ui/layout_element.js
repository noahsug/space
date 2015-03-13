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
  this.setAlign(options.align || 'center');
  this.setPadding.apply(this, options.padding || [0]);

  this.addUnit_('pad-left', 'btn', .66);
  this.addUnit_('pad-bot', 'btn', .16);
  this.addUnit_('pad-bot', 'btn-mix', .14);
  this.addUnit_('pad-bot', 'btn-crowded', .1);
  this.addUnit_('pad-left', 'btn-lg', .6);
  this.addUnit_('pad-top', 'btn-lg', .2);
};

LayoutElement.Direction = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
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

LayoutElement.prototype.addFlex = function(opt_flex) {
  var e = this.uiElement_.create();
  this.add(e, {flex: opt_flex || 1});
};

LayoutElement.prototype.add = function(element, opt_options) {
  this.elements_.push(element);
  if (!opt_options) return;
  if (_.isDef(opt_options.flex)) element.layout.flex = opt_options.flex;
  if (_.isDef(opt_options.align))
    element.layout.align = opt_options.align;
  if (_.isDef(opt_options.padding))
    element.setPadding.apply(element, opt_options.padding);
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
    } else if (this.align_ != o.left) {
      _.fail('Invalid children align:', this.align_);
    }
  }
  for (var i = 0; i < this.elements_.length; i++) {
    var e = this.elements_[i];
    if (e.layout.flex) {
      e[o.maxWidth_] = freeWidth * e.layout.flex / totalFlex;
    } else {
      e[o.maxWidth_] = e[o.width];
    }
    this.positionElement_(e, distance, y);
    distance += e[o.maxWidth_];
    e.update();
  }
};

LayoutElement.prototype.positionElement_ = function(e, distance, y) {
  var o = this.oriented_;
  var dx;
  if (e.layout.align == o.left) {
    dx = 0;
  } else if (e.layout.align == o.center) {
    dx = e[o.maxWidth_] / 2;
  } else if (e.layout.align == o.right) {
    dx = e[o.maxWidth_];
  } else {
    _.fail('Invalid layout align:', e.layout.align);
  }
  this.orientedSetPosition_(e, distance + dx, y);
};

LayoutElement.prototype.orientedSetPosition_ = function(e, x, y) {
  if (this.direction_ == LayoutElement.Direction.HORIZONTAL) {
    e.setPos(x, y);
  } else {
    e.setPos(y, x);
  }
};
