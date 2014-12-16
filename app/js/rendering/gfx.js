var Gfx = di.service('Gfx', [
  'Screen', 'ctx']);

Gfx.Color = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  RED: '#FF0000',
  GREEN: '#00FF00',
  BLUE: '#7799FF',
  YELLOW: '#FFFF00'
};

Gfx.DrawFn = {
  CIRCLE: 0,
  LINE: 1,
  TRIANGLE: 2
};

Gfx.AttrMap = {
  layer: '',
  fill: 'fillStyle',
  stroke: 'strokeStyle',
  lineWidth: 'lineWidth'
};
Gfx.AttrNames = _.keys(Gfx.AttrMap);

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
    // Style already exists.
    return nextStyle.id;
  } else {
    var style = {
      id: this.nextStyleId_++,
      attrs: styleAttrs,
      sortOn: styleStr,
      drawFns: new List()
    };
    this.idToStyle_[style.id] = style;
    this.sortedStyles_.splice(index, 0, style);
    return style.id;
  }
};

Gfx.prototype.getStyleStr_ = function(attrs) {
  attrs.layer = _.ifDef(attrs.layer, 5);
  return _.map(Gfx.AttrNames, function(name) {
    var value = attrs[name];
    return _.ifDef(value, '~');
  }).join('~');
};

Gfx.prototype.setStyle = function(styleId) {
  this.currentStyle_ = this.idToStyle_[styleId];
};

Gfx.prototype.circle = function(x, y, radius) {
  this.addDrawFn_([Gfx.DrawFn.CIRCLE, x, y, radius]);
};

Gfx.prototype.line = function(x, y, dx, dy) {
  this.addDrawFn_([Gfx.DrawFn.LINE, x, y, dx, dy]);
};

Gfx.prototype.triangle = function(x1, y1, x2, y2, x3, y3) {
  this.addDrawFn_([Gfx.DrawFn.TRIANGLE, x1, y1, x2, y2, x3, y3]);
};

Gfx.prototype.addDrawFn_ = function(drawFnArgs) {
  if (this.currentStyle_.flushCount != this.flushCount_) {
    this.currentStyle_.drawFns.length = 0;
    this.currentStyle_.flushCount = this.flushCount_;
  }
  this.currentStyle_.drawFns[this.currentStyle_.drawFns.length++] = drawFnArgs;
};

Gfx.prototype.flush = function() {
  var prevStyleAttrs = _.clone(Gfx.AttrMap);
  for (var si = 0; si < this.sortedStyles_.length; si++) {
    var style = this.sortedStyles_[si];
    if (style.flushCount != this.flushCount_) continue;

    // Change context state.
    for (var i = 1; i < Gfx.AttrNames.length; i++) {
      var name = Gfx.AttrNames[i];
      var value = style.attrs[name];
      if (_.isDef(value) && prevStyleAttrs[name] != value) {
        prevStyleAttrs[name] = value;
        this.ctx_[Gfx.AttrMap[name]] = value;
      }
    }

    // Draw every shape that has the same style.
    this.ctx_.beginPath();
    for (var i = 0; i < style.drawFns.length; i++) {
      var args = style.drawFns[i];
      var isFirst = i == style.drawFns.length;
      if (args[0] == Gfx.DrawFn.CIRCLE) {
        this.drawCircle_(args[1], args[2], args[3], isFirst);
      } else if (args[0] == Gfx.DrawFn.LINE) {
        this.drawLine_(args[1], args[2], args[3], args[4]);
      } else if (args[0] == Gfx.DrawFn.TRIANGLE) {
        this.drawTriangle_(
            args[1], args[2], args[3], args[4], args[5], args[6]);
      } else {
        throw 'Invalid shape id: ' +  args[0];
      }
    }
    if (style.attrs.fill) this.ctx_.fill();
    if (style.attrs.stroke) this.ctx_.stroke();
  }
  this.flushCount_++;
};

Gfx.prototype.drawCircle_ = function(x, y, radius, isFirst) {
  if (!isFirst) {
    this.ctx_.moveTo(x + radius, y);
  }
  this.ctx_.arc(x, y, radius, 0, Math.PI * 2);
};

Gfx.prototype.drawLine_ = function(x, y, dx, dy) {
  this.ctx_.moveTo(x, y);
  this.ctx_.lineTo(x + dx, y + dy);
};

Gfx.prototype.drawTriangle_ = function(x1, y1, x2, y2, x3, y3) {
  this.ctx_.moveTo(x1, y1);
  this.ctx_.lineTo(x2, y2);
  this.ctx_.lineTo(x3, y3);
  this.ctx_.lineTo(x1, y1);
};
