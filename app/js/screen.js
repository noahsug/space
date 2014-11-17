var Screen = di.service('Screen', ['window', 'canvas']);

Screen.prototype.init = function() {
  this.resize();
  this.center(0, 0);
};

Screen.prototype.setSurfaceArea = function(area) {
  this.surfaceArea_ = area;
  this.resize();
};

Screen.prototype.center = function(x, y) {
  this.x_ = x;
  this.y_ = y;
};

Screen.prototype.getCenter = function() {
  return {x: this.x_, y: this.y_};
};

Screen.prototype.screenToDraw = function(x, y) {
  var pos = this.screenToCanvas(x, y);
  return this.canvasToDraw(pos.x, pos.y);
};

Screen.prototype.screenToCanvas = function(x, y) {
  var upscale = this.getUpscale_();
  return {
    x: x / upscale - this.width / 2 + this.x_,
    y: y / upscale - this.height / 2 + this.y_
  };
};

Screen.prototype.canvasToDraw = function(x, y) {
  return {
    x: x + this.width / 2 - this.x_,
    y: y + this.height / 2 - this.y_
  };
};

Screen.prototype.resize = function() {
  var upscale = this.getUpscale_();
  this.canvas_.width = this.window_.innerWidth / upscale;
  this.canvas_.height = this.window_.innerHeight / upscale;
  this.canvas_.style.width = this.window_.innerWidth + 'px';
  this.canvas_.style.height = this.window_.innerHeight + 'px';

  this.width = this.canvas_.width;
  this.height = this.canvas_.height;
  this.portrait = this.width > this.height;
};

Screen.prototype.getUpscale_ = function() {
  if (_.isDef(this.surfaceArea_)) {
    var actualSurfaceArea = this.window_.innerHeight * this.window_.innerWidth;
    return Math.sqrt(actualSurfaceArea / this.surfaceArea_);
  }
  return 1;
};
