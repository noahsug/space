var LayoutElement = di.factory('LayoutElement', [
  'Screen', 'EntityElement']);

LayoutElement.prototype.init = function(direction) {
  di.extend(this, this.EntityElement_, 'container');

  this.elements_ = [];
  this.oriented_ = {};
  this.oriented_.padding = {};

  this.setDirection(direction);
  // Acts as layout.align/baseline of child elements when not specified
  this.setChildrenBaselineAlign('top', 'left');
  this.setPadding(0);
};

LayoutElement.prototype.setDirection = function(direction) {
  this.direction_ = direction;
  if (direction == 'horizontal') {
    this.oriented_.top = 'top';
    this.oriented_.right = 'right';
    this.oriented_.bottom = 'bottom';
    this.oriented_.left = 'left';
    this.oriented_.center = 'center';
    this.oriented_.middle = 'middle';
    this.oriented_.height = 'height';
    this.oriented_.width = 'width';
    this.oriented_.maxHeight = 'maxHeight';
    this.oriented_.maxWidth = 'maxWidth';
    this.oriented_.innerWidth = 'innerWidth';
    this.oriented_.innerHeight = 'innerHeight';
    this.oriented_.calcWidth = 'calcWidth';
    this.oriented_.calcHeight = 'calcHeight';
    this.oriented_.calcMaxWidth = 'calcMaxWidth';
    this.oriented_.calcMaxHeight = 'calcMaxHeight';
    this.oriented_.calcFreeWidth = 'calcFreeWidth';
    this.oriented_.calcFreeHeight = 'calcFreeHeight';
    this.oriented_.baseline = 'baseline';
    this.oriented_.align = 'align';
    this.oriented_.childrenAlign_ = 'childrenAlign_';
    this.oriented_.childrenBaseline_ = 'childrenBaseline_';
    this.oriented_.x = 'x';
    this.oriented_.y = 'y';
  } else if (direction == 'vertical') {
    this.oriented_.top = 'left';
    this.oriented_.right = 'bottom';
    this.oriented_.bottom = 'right';
    this.oriented_.left = 'top';
    this.oriented_.center = 'middle';
    this.oriented_.middle = 'center';
    this.oriented_.height = 'width';
    this.oriented_.width = 'height';
    this.oriented_.maxHeight = 'maxWidth';
    this.oriented_.maxWidth = 'maxHeight';
    this.oriented_.innerWidth = 'innerHeight';
    this.oriented_.innerHeight = 'innerWidth';
    this.oriented_.calcWidth = 'calcHeight';
    this.oriented_.calcHeight = 'calcWidth';
    this.oriented_.calcMaxWidth = 'calcMaxHeight';
    this.oriented_.calcMaxHeight = 'calcMaxWidth';
    this.oriented_.calcFreeWidth = 'calcFreeHeight';
    this.oriented_.calcFreeHeight = 'calcFreeWidth';
    this.oriented_.baseline = 'align';
    this.oriented_.align = 'baseline';
    this.oriented_.childrenAlign_ = 'childrenBaseline_';
    this.oriented_.childrenBaseline_ = 'childrenAlign_';
    this.oriented_.x = 'y';
    this.oriented_.y = 'x';
  } else {
    _.fail('invalid direction: ' + direction);
  }
  return this;
};

LayoutElement.prototype.animate = function(prop, value, opt_options) {
  _.each(this.elements_, function(e) {
    if (e.canAnimate(prop)) e.animate(prop, value, opt_options);
  });
  return this;
};

LayoutElement.prototype.setAlpha = function(alpha) {
  _.each(this.elements_, function(e) {
    if (e.setAlpha) e.setAlpha(alpha);
  });
  return this.base_.setAlpha.call(this, alpha);
};

// Makes the this.entity_ fill all non-primary space.
LayoutElement.prototype.setBgFill = function(fill) {
  this.bgFill_ = fill;
  return this;
};

LayoutElement.prototype.setChildrenFill = function(fill) {
  this.childrenFill_ = fill;
  return this;
};

LayoutElement.prototype.setChildrenAlign = function(align) {
  this.childrenAlign_ = align;
  return this;
};

LayoutElement.prototype.setChildrenBaseline = function(baseline) {
  this.childrenBaseline_ = baseline;
  return this;
};

LayoutElement.prototype.setChildrenBaselineAlign = function(baseline, align) {
  this.childrenBaseline_ = baseline;
  this.childrenAlign_ = align;
  return this;
};

LayoutElement.prototype.addFlex = function(opt_flex) {
  var e = this.UiElement_.new();
  return this.add(e, {flex: opt_flex || 1});
};

LayoutElement.prototype.addGap = function(size) {
  var e = this.UiElement_.new();
  return this.add(e, {padding: [size, size, 0, 0]});
};

// Inserts the element at the front, useful for consuming mouse events.
LayoutElement.prototype.addFront = function(element, opt_options) {
  this.add(element, opt_options);
  _.swap(this.elements_, 0, this.elements_.length - 1);
};

LayoutElement.prototype.add = function(element, opt_options) {
  this.elements_.push(element);
  if (opt_options) {
    if (_.isDef(opt_options.flex)) element.layout.flex = opt_options.flex;
    if (_.isDef(opt_options.align)) element.layout.align = opt_options.align;
    if (_.isDef(opt_options.padding))
      element.setPadding.apply(element, opt_options.padding);
  }
  return this;
};

LayoutElement.prototype.calcInnerWidthHeight_ = function() {
  var o = this.oriented_;
  var hasFlex = false;
  this[o.innerWidth] = 0;
  this[o.innerHeight] = 0;
  for (var i = 0; i < this.elements_.length; i++) {
    var e = this.elements_[i];
    e.calcSize_();
    if (e[o.height] > this[o.innerHeight]) this[o.innerHeight] = e[o.height];
    this[o.innerWidth] += e[o.width];
    if (e.layout.flex) hasFlex = true;
  }
};

LayoutElement.prototype.child = function(opt_index) {
  return this.elements_[opt_index || 0];
};

LayoutElement.prototype.positionChild_ = function(origX, origY) {
  var o = this.oriented_;
  var x = this.direction_ == 'horizontal' ? origX : origY;
  var y = this.direction_ == 'horizontal' ? origY : origX;
  var freeWidth = this[o.calcFreeWidth]();
  var totalFlex = 0;
  var childAlign = '';
  for (var i = 0; i < this.elements_.length; i++) {
    var e = this.elements_[i];
    if (!e.layout.flex) {
      freeWidth -= e[o.width];
      childAlign = e.layout[o.align];
    } else {
      totalFlex += e.layout.flex;
    }
  }

  var dx = 0;
  if (totalFlex == 0) {
    var align = childAlign || this[o.childrenAlign_];
    if (align == o.center) {
      dx += freeWidth / 2;
    } else if (align == o.right) {
      dx += freeWidth;
    }
  }

  for (var i = 0; i < this.elements_.length; i++) {
    var e = this.elements_[i];
    if (e.layout.flex) {
      e[o.maxWidth] = freeWidth * e.layout.flex / totalFlex;
    } else {
      e[o.maxWidth] = e[o.width];
    }
    e[o.maxHeight] = (e.layout.fill || this.childrenFill_) ?
        this[o.calcFreeHeight]() : this[o.innerHeight];
    this.positionElement_(e, x + dx, y);
    dx += e[o.maxWidth];
  }

  this.positionEntity_();
};

LayoutElement.prototype.positionElement_ = function(e, x, y) {
  var o = this.oriented_;
  var dx = 0;
  var align = e.layout[o.align] || this[o.childrenAlign_];
  if (align == o.center) {
    dx = (e[o.maxWidth] - e[o.width]) / 2;
  } else if (align == o.right) {
    dx = e[o.maxWidth] - e[o.width];
  }
  var dy = 0;
  var baseline = e.layout[o.baseline] || this[o.childrenBaseline_];
  var freeHeight = this[o.calcFreeHeight]();
  if (baseline == o.middle) {
    dy = (freeHeight - e[o.height]) / 2;
  } else if (baseline == o.bottom) {
    dy = freeHeight - e[o.height];
  }
  this.orientedSetPosition_(e, x + dx, y + dy);
};

LayoutElement.prototype.orientedSetPosition_ = function(e, x, y) {
  if (this.direction_ == 'horizontal') {
    e.setPos(x, y);
  } else {
    e.setPos(y, x);
  }
};

LayoutElement.prototype.positionEntity_ = function() {
  var dx = 0;
  var dy = 0;
  if (this.childrenAlign_ == 'center') {
    dx += (this.calcMaxWidth() - this.calcWidth()) / 2;
  } else if (this.childrenAlign_ == 'right') {
    dx += this.calcMaxWidth() - this.calcWidth();
  }
  if (this.childrenBaseline_ == 'middle') {
    dy += (this.calcMaxHeight() - this.calcHeight()) / 2;
  } else if (this.childrenAlign_ == 'bottom') {
    dy += this.calcMaxHeight() - this.calcHeight();
  }
  this.base_.positionChild_.call(this, this.x + dx, this.y + dy);
};

LayoutElement.prototype.collides_ = function(point) {
  var bounds = {
    x: this.entity_.staticX,
    y: this.entity_.staticY,
    width: this.entity_.width,
    height: this.entity_.height
  };
  return this.collision_.rectPoint(bounds, point);
};

LayoutElement.prototype.update_ = function(dt) {
  if (this.bgFill_) {
    this.entity_.width = this.calcMaxWidth();
    this.entity_.height = this.calcMaxHeight();
  } else {
    this.entity_.width = this.calcWidth();
    this.entity_.height = this.calcHeight();
  }
  this.base_.update_.call(this, dt);
};
