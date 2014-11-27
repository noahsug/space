var Gfx = di.service('Gfx', [
  'Screen', 'ctx']);

Gfx.Color = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  RED: '#FF0000',
  GREEN: '#00FF00'
};

Gfx.DrawFns = {
  CIRCLE: function(x, y, radius, isFirst) {
    if (!isFirst) {
      this.ctx_.moveTo(x + radius, y);
    }
    this.ctx_.arc(x, y, radius, 0, Math.PI * 2);
  }
};

Gfx.AttrNames = {
  fill: 'fillStyle',
  stroke: 'strokeStyle',
  lineWidth: 'lineWidth'
};

Gfx.prototype.init = function() {
  this.nextStyleId_ = 0;
  this.sortedStyles_ = [];
  this.idToStyle_ = [];
  this.flushCount_ = 0;
};

Gfx.prototype.addStyle = function(styleAttrs) {
  var styleStr = this.getStyleStr_(styleAttrs);

  var index = _.sortedIndex(this.sortedStyles_, {sortOn: styleStr}, 'sortOn');
  var nextStyle = this.sortedStyles_[index];
  if (nextStyle && nextStyle.sortOn == styleStr) {
    return nextStyle.id;
  } else {
    var style = {
      id: this.nextStyleId_++,
      attrs: styleAttrs,
      sortOn: styleStr,
      position: index
    };
    this.idToStyle_[style.id] = style;
    this.sortedStyles_.splice(index, 0, style);
    for (var i = index + 1; i < this.sortedStyles_.length; i++) {
      this.sortedStyles_[i].position++;
    }
    return style.id;
  }
};

Gfx.prototype.getStyleStr_ = function(attrs) {
  return _.map(Gfx.AttrNames, function(fnName, name) {
    var value = attrs[name];
    return _.ifDef(value, '!');
  }).join('"');
};

Gfx.prototype.setStyle = function(styleId) {
  this.currentStyle_ = this.idToStyle_[styleId];
};

Gfx.prototype.circle = function(x, y, radius) {
  this.addDrawFn_(Gfx.DrawFns.CIRCLE.bind(this, x, y, radius));
};

Gfx.prototype.addDrawFn_ = function(drawFn) {
  if (this.currentStyle_.flushCount != this.flushCount_) {
    this.currentStyle_.flushCount = this.flushCount_;
    this.currentStyle_.drawFns = [drawFn];
  } else {
    this.currentStyle_.drawFns.push(drawFn);
  }
};

Gfx.prototype.flush = function() {
  var prevStyleAttrs = Gfx.AttrNames;
  _.each(this.sortedStyles_, function(style) {
    if (style.flushCount != this.flushCount_) return;

    // Change context state.
    _.each(style.attrs, function(value, name) {
      if (prevStyleAttrs[name] != value) {
        this.ctx_[Gfx.AttrNames[name]] = value;
      }
    }, this);

    // Draw every shape that has the same style.
    this.ctx_.beginPath();
    _.each(style.drawFns, function(drawFn, i) {
      drawFn(i == style.drawFns.length);
    });
    if (style.attrs.fill) this.ctx_.fill();
    if (style.attrs.stroke) this.ctx_.stroke();

    prevStyleAttrs = style.attrs;
  }, this);
  this.flushCount_++;
};
