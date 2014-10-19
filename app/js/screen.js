var Screen = di.service('Screen', ['window', 'canvas']);

Screen.prototype.init = function() {
  this.zoom(1);
  this.center(0, 0);
};

Screen.prototype.zoom = function(zoom) {
  this.zoom_ = zoom;
  this.onResize();
};

Screen.prototype.center = function(x, y) {
  this.x_ = x;
  this.y_ = y;
};

Screen.prototype.translate = function(x, y) {
  return {
    x: x  + this.width / 2 - this.x_,
    y: y + this.height / 2 - this.y_
  };
};

Screen.prototype.translateMouse = function(x, y) {
  return this.translate(x / this.zoom_, y / this.zoom_);
};

Screen.prototype.onResize = function() {
  this.canvas_.width = this.window_.innerWidth / this.zoom_;
  this.canvas_.height = this.window_.innerHeight / this.zoom_;
  this.canvas_.style.width = this.window_.innerWidth + 'px';
  this.canvas_.style.height = this.window_.innerHeight + 'px';

  this.width = this.canvas_.width;
  this.height = this.canvas_.height;
};
