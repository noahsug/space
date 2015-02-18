var Gfx = di.service('Gfx', [
  'Screen', 'ctx']);

Gfx.Font = {
  TITLE: 'ElegantLux',
  TEXT: 'Arial'
};

Gfx.Color = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  OPAC_WHITE: 'rgba(255, 255, 255, .5)',
  RED: '#FF0000',
  GREEN: '#00FF00',
  BLUE: '#7799FF',
  OPAC_RED: 'rgba(255, 0, 0, .4)',
  MORE_OPAC_RED: 'rgba(255, 0, 0, .3)',
  OPAC_BLUE: 'rgba(50, 50, 255, .65)',
  MORE_OPAC_BLUE: 'rgba(50, 50, 255, .2)',
  OPAC_YELLOW: 'rgba(255, 255, 50, .4)',
  YELLOW: '#FFFF00',
  PINK: '#FFCCEE',
  GRAY: 'rgb(120, 120, 120)',
  OPAC_GRAY: 'rgba(50, 50, 50, .5)',
  LESS_OPAC_GRAY: 'rgba(50, 50, 50, .8)',

  SUCCESS: '#99FF99',
  WARN: '#FF5544',
  INFO: '#9999FF',
  LOCKED: '#666'
};

Gfx.DrawFn = {
  CIRCLE: 0,
  LINE: 1,
  TRIANGLE: 2
};

Gfx.AttrMap = {
  layer: '',
  shadow: 'shadowColor',
  shadowBlur: 'shadowBlur',
  fill: 'fillStyle',
  stroke: 'strokeStyle',
  lineWidth: 'lineWidth'
};
Gfx.AttrNames = _.keys(Gfx.AttrMap);

Gfx.AttrDefaults = {
  shadowColor: 'rgba(0, 0, 0, 0)',
  shadowBlur: 0,
  globalAlpha: 1
};

Gfx.prototype.init = function() {
  this.nextStyleId_ = 0;
  this.sortedStyles_ = [];
  this.idToStyle_ = [];
  this.flushCount_ = 0;
};

Gfx.prototype.addStyle = function(styleAttrs) {
  this.setDefaults_(styleAttrs);
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
      drawFns: new List(),
      customDrawFns: new List()
    };
    this.idToStyle_[style.id] = style;
    this.sortedStyles_.splice(index, 0, style);
    return style.id;
  }
};

Gfx.prototype.setDefaults_ = function(attrs) {
  if (attrs['shadow'] == 'none') return;
  var stroke = attrs['stroke'];
  if (stroke) {
    if (!attrs['shadow']) attrs['shadow'] = stroke;
    if (!attrs['shadowBlur']) attrs['shadowBlur'] = 6;
  }
};

Gfx.prototype.getStyleStr_ = function(attrs) {
  attrs.layer = _.ifDef(attrs.layer, 5);
  return _.map(Gfx.AttrNames, function(name) {
    var value = attrs[name];
    return _.ifDef(value, '~');
  }).join('~');
};

Gfx.prototype.setStyle = function(styleId, opt_customStyle) {
  this.currentStyle_ = this.idToStyle_[styleId];
  this.customStyle_ = opt_customStyle;
};

Gfx.prototype.circle = function(x, y, radius) {
  this.addDrawFn_(Gfx.DrawFn.CIRCLE, x, y, radius);
};

Gfx.prototype.line = function(x, y, dx, dy) {
  this.addDrawFn_(Gfx.DrawFn.LINE, x, y, dx, dy);
};

Gfx.prototype.triangle = function(x1, y1, x2, y2, x3, y3) {
  this.addDrawFn_(Gfx.DrawFn.TRIANGLE, x1, y1, x2, y2, x3, y3);
};

Gfx.prototype.addDrawFn_ = function(var_drawFnArgs) {
  if (this.currentStyle_.flushCount != this.flushCount_) {
    this.currentStyle_.drawFns.length = 0;
    this.currentStyle_.customDrawFns.length = 0;
    this.currentStyle_.flushCount = this.flushCount_;
  }
  if (this.customStyle_) {
    arguments.customStyle = this.customStyle_;
    var len = this.currentStyle_.customDrawFns.length++;
    this.currentStyle_.customDrawFns[len] = arguments;
  } else {
    this.currentStyle_.drawFns[this.currentStyle_.drawFns.length++] = arguments;
  }
};

Gfx.prototype.flush = function() {
  this.ctx_.save();
  var prevStyleAttrs = _.clone(Gfx.AttrMap);
  for (var si = 0; si < this.sortedStyles_.length; si++) {
    var style = this.sortedStyles_[si];
    if (style.flushCount != this.flushCount_) continue;

    // Change context state.
    for (var i = 1; i < Gfx.AttrNames.length; i++) {
      var name = Gfx.AttrNames[i];
      var value = style.attrs[name];
      if (prevStyleAttrs[name] != value) {
        prevStyleAttrs[name] = value;
        if (_.isDef(value)) {
          this.ctx_[Gfx.AttrMap[name]] = value;
        } else if (_.isDef(Gfx.AttrDefaults[name])) {
          this.ctx_[Gfx.AttrMap[name]] = Gfx.AttrDefaults[name];
        }
      }
    }
    this.ctx_.closePath();

    // Draw every shape that has the same style.
    this.ctx_.beginPath();
    for (var i = 0; i < style.drawFns.length; i++) {
      var isFirst = i == style.drawFns.length;
      this.drawShape_(style.drawFns[i], isFirst);
    }
    if (style.attrs.fill) this.ctx_.fill();
    if (style.attrs.stroke) this.ctx_.stroke();

    // Draw shapes with custom styles.
    for (var i = 0; i < style.customDrawFns.length; i++) {
      var args = style.customDrawFns[i];
      this.setCustomStyles_(args.customStyle);
      this.ctx_.beginPath();
      this.drawShape_(args, true);
      if (style.attrs.fill) this.ctx_.fill();
      if (style.attrs.stroke) this.ctx_.stroke();
      this.setCustomStyles_(args.customStyle, prevStyleAttrs);
    }
    this.ctx_.closePath();
  }
  this.flushCount_++;
  this.ctx_.restore();
};

Gfx.prototype.drawShape_ = function(args, isFirst) {
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
};

Gfx.prototype.setCustomStyles_ = function(customStyle, opt_restoreTo) {
  var set = !opt_restoreTo;
  var keys = Object.keys(customStyle);
  for (var j = 0; j < keys.length; j++) {
    var name = keys[j];
    var value = set ? customStyle[name] :
        opt_restoreTo[name] || Gfx.AttrDefaults[name];
    this.ctx_[name] = value;
  }
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
