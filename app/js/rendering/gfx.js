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
  LINE: 1
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
      position: index,
      drawFns: new List()
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
  this.addDrawFn_([Gfx.DrawFn.CIRCLE, x, y, radius]);
};

Gfx.prototype.line = function(x, y, dx, dy) {
  this.addDrawFn_([Gfx.DrawFn.LINE, x, y, dx, dy]);
};

Gfx.prototype.addDrawFn_ = function(drawFnArgs) {
  if (this.currentStyle_.flushCount != this.flushCount_) {
    this.currentStyle_.drawFns.length = 0;
    this.currentStyle_.flushCount = this.flushCount_;
  }
  this.currentStyle_.drawFns[this.currentStyle_.drawFns.length++] = drawFnArgs;
};

Gfx.prototype.flush = function() {
  var prevStyleAttrs = Gfx.AttrNames;
  for (var si = 0; si < this.sortedStyles_.length; si++) {
    var style = this.sortedStyles_[si];
    if (style.flushCount != this.flushCount_) continue;

    // Change context state.
    for (var name in style.attrs) {
      var value = style.attrs[name];
      if (prevStyleAttrs[name] != value) {
        this.ctx_[Gfx.AttrNames[name]] = value;
      }
    }

    // Draw every shape that has the same style.
    this.ctx_.beginPath();
    for (var i = 0; i < style.drawFns.length; i++) {
      var args = style.drawFns[i];
      var drawFn;
      if (args[0] == Gfx.DrawFn.CIRCLE) {
        this.drawCircle_(args[1], args[2], args[3],
            i == style.drawFns.length);
      } else if (args[0] == Gfx.DrawFn.LINE) {
        this.drawLine_(args[1], args[2], args[3], args[4],
            i == style.drawFns.length);
      } else {
        throw 'Invalid shape id: ' +  args[0];
      }
    }
    if (style.attrs.fill) this.ctx_.fill();
    if (style.attrs.stroke) this.ctx_.stroke();

    prevStyleAttrs = style.attrs;
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
  this.ctx_.lineTo(x - dx, y - dy);
};
