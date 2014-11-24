var Screen = di.service('Screen', ['window', 'canvas', 'bgCanvasList']);

Screen.DESIRED_SURFACE_AREA = 134400;

Screen.prototype.init = function() {
  this.resize();
  this.center(0, 0);
};

Screen.prototype.setSurfaceArea = function(area) {
  this.surfaceArea_ = area;
  this.resize({resizeBg: true});
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

Screen.prototype.resize = function(opt_options) {
  var upscale = this.getUpscale_();
  this.resizeCanvas_(upscale, this.canvas_);
  if (opt_options && opt_options.resizeBg) {
    _.each(this.bgCanvasList_, this.resizeCanvas_.bind(this, upscale));
  }

  this.width = this.canvas_.width;
  this.height = this.canvas_.height;
  this.portrait = this.width > this.height;
};

Screen.prototype.resizeCanvas_ = function(upscale, canvas) {
  canvas.width = this.window_.innerWidth / upscale;
  canvas.height = this.window_.innerHeight / upscale;
  canvas.style.width = this.window_.innerWidth + 'px';
  canvas.style.height = this.window_.innerHeight + 'px';
};

Screen.prototype.getUpscale_ = function() {
  if (_.isDef(this.surfaceArea_)) {
    var actualSurfaceArea = this.window_.innerHeight * this.window_.innerWidth;
    return Math.sqrt(actualSurfaceArea / this.surfaceArea_);
  }
  return 1;
};
