var Mouse = di.service('Mouse', ['Screen']);

Mouse.prototype.init = function() {
  this.x = 100000;
  this.y = 100000;
  this.down = false;
  this.pressed = false;
  this.released = false;
  this.clicked = false;
  this.keysPressed = {};
};

Mouse.prototype.onMouseMove = function(e) {
  if (e.touches) this.updateTouchPos_(e);
  else this.updatePos_(e.x, e.y);
};

Mouse.prototype.onMouseDown = function(e) {
  this.down = true;
  this.pressed = true;
  this.clicked = true;
  if (e.touches) this.updateTouchPos_(e);
};

Mouse.prototype.onMouseUp = function(e) {
  this.down = false;
  this.released = true;
};

Mouse.prototype.updateTouchPos_ = function(e) {
  this.updatePos_(e.touches[0].clientX, e.touches[0].clientY);
};

Mouse.prototype.updatePos_ = function(x, y) {
  this.staticX = x / this.screen_.upscale;
  this.staticY = y / this.screen_.upscale;
  var pos = this.screen_.screenToCanvas(x, y);
  this.x = pos.x;
  this.y = pos.y;
};

Mouse.prototype.onKeyDown = function(number) {
  this.keysPressed[number] = true;
};

Mouse.prototype.clearInput = function() {
  this.clicked = false;
  this.pressed = this.down;
  this.released = !this.down;
  this.keysPressed = {};
};
