var Screen = di.service('Screen', ['window', 'canvas']);

Screen.DESIRED_SURFACE_AREA = 134400;

Screen.prototype.init = function() {
  this.resize();
  this.center(0, 0);
};

Screen.prototype.setSurfaceArea = function(area) {
  this.surfaceArea_ = area;
  this.resize();
};

Screen.prototype.getSurfaceArea = function() {
  return this.surfaceArea_;
};

Screen.prototype.zoom = function(amount) {
  this.surfaceArea_ -= amount;
  this.resize();
};

Screen.prototype.center = function(x, y) {
  this.x = x;
  this.y = y;
};

Screen.prototype.screenToDraw = function(x, y) {
  var pos = this.screenToCanvas(x, y);
  return this.canvasToDraw(pos.x, pos.y);
};

Screen.prototype.screenToCanvas = function(x, y, opt_z) {
  var upscale = this.getUpscale_();
  var z = opt_z || 1;
  return {
    x: x / upscale - this.width / 2 + this.x / z,
    y: y / upscale - this.height / 2 + this.y / z
  };
};

Screen.prototype.canvasToDraw = function(x, y, opt_z) {
  var z = opt_z || 1;
  return {
    x: x + this.width / 2 - this.x / z,
    y: y + this.height / 2 - this.y / z
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
