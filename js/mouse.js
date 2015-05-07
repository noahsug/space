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
  this.screenX = e.x / this.screen_.upscale;
  this.screenY = e.y / this.screen_.upscale;
  var pos = this.screen_.screenToCanvas(e.x, e.y);
  this.x = pos.x;
  this.y = pos.y;
};

Mouse.prototype.onMouseDown = function() {
  this.down = true;
  this.pressed = true;
  this.clicked = true;
};

Mouse.prototype.onMouseUp = function() {
  this.down = false;
  this.released = true;
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
