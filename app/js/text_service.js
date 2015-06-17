var TextService = di.service('TextService', ['ctx']);

/**
 * These functions are specific to the OratorStd font.
 */

TextService.prototype.width = function(text, size) {
  this.ctx_.font = size + 'px ' + Gfx.Font.TEXT;
  var width = this.ctx_.measureText(text).width;
  return width - size * .2;
};

TextService.prototype.height = function(size) {
  return size * .75;
};

TextService.prototype.offset = function(size) {
  return {x: -size * .1, y: size * .05};
};

TextService.prototype.wrap = function(text, size, maxWidth) {
  var words = text.split(' ');
  var lines = [];
  var line = '';

  for(var n = 0; n < words.length; n++) {
    var testLine = line + (line && ' ') + words[n];
    var testWidth = this.width(testLine, size);
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n];
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  return lines;
};
