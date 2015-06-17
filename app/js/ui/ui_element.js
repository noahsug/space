var UiElement = di.factory('UiElement', [
  'Screen', 'Collision', 'Mouse', 'GameModel as gm']);

UiElement.prototype.init = function() {
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;
  this.maxWidth = null;
  this.maxHealth = null;
  this.innerWidth = 0;
  this.innerHeight = 0;
  this.baseline = 'top';
  this.align = 'left';
  // Uses layout.baseline and layout.align when these have no value.
  this.layout = {baseline: '', align: '', flex: 0};
  this.padding = {};
  this.setPadding(0);
  this.hitboxMargin_ = 0;

  this.calc_ = {};  // Store calculated values.
  this.calc_.padding = {};
};

UiElement.prototype.setLayoutAlign = function(layoutAlign) {
  this.layout.align = layoutAlign;
  return this;
};

UiElement.prototype.setLayoutBaseline = function(layoutBaseline) {
  this.layout.baseline = layoutBaseline;
  return this;
};

UiElement.prototype.setLayoutBaselineAlign = function(
    layoutBaseline, layoutAlign) {
  this.layout.baseline = layoutBaseline;
  this.layout.align = layoutAlign;
  return this;
};

UiElement.prototype.setLayoutFlex = function(flex) {
  this.layout.flex = flex;
  return this;
};

// Whether the element fills out the non-primary dimension.
UiElement.prototype.setLayoutFill = function(fill) {
  this.layout.fill = fill;
  return this;
};

UiElement.prototype.setAlign = function(align) {
  this.align = align;
  return this;
};

UiElement.prototype.setBaseline = function(baseline) {
  this.baseline = baseline;
  return this;
};

UiElement.prototype.setBaselineAlign = function(baseline, align) {
  if (baseline) this.baseline = baseline;
  if (align) this.align = align;
  return this;
};

UiElement.prototype.setPadding = function(top, right, bottom, left) {
  if (_.isString(top)) {
    var name = top; var value = right;
    this.padding[name] = value;
    return this;
  }

  if (arguments.length == 1) {
    right = bottom = left = top;
  }
  else if (arguments.length == 2) {
    bottom = top;
    left = right;
  }
  else if (arguments.length == 3) {
    left = right;
  }
  this.padding.top = top;
  this.padding.right = right;
  this.padding.left = left;
  this.padding.bottom = bottom;
  return this;
};

UiElement.prototype.modify = function(fn, opt_context) {
  fn.call(opt_context, this);
  return this;
};

UiElement.prototype.setPos = function(x, y) {
  this.x = x;
  this.y = y;
  this.updateChildPosition_();
  return this;
};

UiElement.prototype.calcMaxWidth = function() {
  return this.maxWidth || this.screen_.width;
};

UiElement.prototype.calcMaxHeight = function() {
  return this.maxHeight || this.screen_.height;
};

UiElement.prototype.calcWidth = function() {
  // innerWidth my be 0 if flex is involed.
  return this.innerWidth ? this.width : this.calcMaxWidth();
};

UiElement.prototype.calcHeight = function() {
  // innerHeight my be 0 if flex is involed.
  return this.innerHeight ? this.height : this.calcMaxHeight();
};

UiElement.prototype.calcFreeWidth = function() {
  return this.calcMaxWidth() - this.calc_.padding.left -
    this.calc_.padding.right;
};

UiElement.prototype.calcFreeHeight = function() {
  return this.calcMaxHeight() - this.calc_.padding.top -
    this.calc_.padding.bottom;
};

UiElement.prototype.update = function() {
  this.calcSize_();
  this.updateChildPosition_();
  this.update_();
};

UiElement.prototype.calcSize_ = function() {
  this.calcPadding_();
  this.calcInnerWidthHeight_();
  this.calcWidthHeight_();
};

UiElement.prototype.calcPadding_ = function() {
  this.calc_.padding.left = this.measure_('pad-left', this.padding.left);
  this.calc_.padding.right = this.measure_('pad-right', this.padding.right);
  this.calc_.padding.top = this.measure_('pad-top', this.padding.top);
  this.calc_.padding.bottom = this.measure_('pad-bot', this.padding.bottom);
};

UiElement.prototype.measure_ = function(type, value) {
  if (value < 1) {
    var dimension =
        ((type == 'pad-left' || type == 'pad-right' || 'size') && 'width') ||
        'height';
    return value * this.screen_[dimension];
  }
  if (!PROD) _.assert(!isNaN(value), 'invalid ' + type + ': ' + value);
  return value;
};

UiElement.prototype.calcInnerWidthHeight_ = _.emptyFn;

UiElement.prototype.calcWidthHeight_ = function() {
  this.width =
    this.calc_.padding.left + this.innerWidth + this.calc_.padding.right;
  this.height =
    this.calc_.padding.top + this.innerHeight + this.calc_.padding.bottom;
};

UiElement.prototype.updateChildPosition_ = function() {
  var xy = this.positionXY_(this.calc_.padding.left + this.x,
                            this.calc_.padding.top + this.y,
                            {inner: true});
  this.positionChild_(xy.x, xy.y);
};

UiElement.prototype.positionChild_ = _.emptyFn;

UiElement.prototype.positionXY_ = function(x, y, opt_options) {
  var options = opt_options || {};
  var width = options.inner ? this.innerWidth : this.width;
  var height = options.inner ? this.innerHeight : this.height;
  switch (this.align) {
    case 'center': x -= width / 2; break;
    case 'right': x -= width; break;
  }
  switch (this.baseline) {
    case 'middle': y -= height / 2; break;
    case 'bottom': y -= height; break;
  }
  return {x: x, y: y};
};

UiElement.prototype.consumeOnClick = function() {
  this.onClickFn_ = _.emptyFn;
  return this;
};

UiElement.prototype.onClick = function(fn, opt_context) {
  this.onClickFn_ = fn.bind(opt_context);
  return this;
};

UiElement.prototype.onClickFn_ = null;

UiElement.prototype.onNotClick = function(fn, opt_context) {
  this.onNotClickFn_ = fn.bind(opt_context);
  return this;
};

UiElement.prototype.onNotClickFn_ = null;

UiElement.prototype.update_ = function() {
  this.handleClickEvents_();
};

UiElement.prototype.handleClickEvents_ = function() {
  if (!this.onClickFn_ && !this.onNotClickFn_) return;
  var collides = this.collides_({x: this.mouse_.staticX,
                                 y: this.mouse_.staticY});
  if (this.mouse_.clicked) {
    var fn = collides ? this.onClickFn_ : this.onNotClickFn_;
    if (fn) {
      fn.call(this, this);
      this.mouse_.clicked = false;
    }
  }
  this.mouseDown = collides && this.mouse_.down;
};

UiElement.prototype.collides_ = function(point) {
  var xy = this.positionXY_(this.x, this.y);
  var bounds = {
    x: xy.x - this.hitboxMargin_,
    y: xy.y - this.hitboxMargin_,
    width: this.calcWidth() + this.hitboxMargin_ * 2,
    height: this.calcHeight() + this.hitboxMargin_ * 2
  };
  return this.collision_.rectPoint(bounds, point);
};
