var Mouse = di.service('Mouse', ['Screen']);

Mouse.prototype.init = function() {
  this.x = 100000;
  this.y = 100000;
  this.down = false;
  this.pressed = false;
  this.released = false;
};

Mouse.prototype.onMouseMove = function(e) {
  var pos = this.screen_.translateMouse(e.x, e.y);
  this.x = pos.x;
  this.y = pos.y;
};

Mouse.prototype.onMouseDown = function() {
  this.down = true;
  this.pressed = true;
};

Mouse.prototype.onMouseUp = function() {
  this.down = false;
  this.released = true;
};

Mouse.prototype.clearInput = function() {
  this.pressed = this.released = false;
};
