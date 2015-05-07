var Screen = di.service('Screen', [
  'window', 'canvas', 'textCanvas', 'bgCanvasList']);

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
  this.resize({resizeBg: false});
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
  var z = opt_z || 1;
  return {
    x: x / this.upscale - this.width / 2 + this.x / z,
    y: y / this.upscale - this.height / 2 + this.y / z
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
  this.upscale = this.getUpscale_();
  this.resizeCanvas_(this.canvas_);
  if (!opt_options || opt_options.resizeBg) {
    _.each(this.bgCanvasList_, this.resizeCanvas_.bind(this));
  }
  this.resizeCanvasWithoutUpscale_(this.textCanvas_);

  this.width = this.canvas_.width;
  this.height = this.canvas_.height;
  this.pixelWidth = this.window_.innerWidth;
  this.pixelHeight = this.window_.innerHeight;
  this.portrait = this.width > this.height;
};

Screen.prototype.resizeCanvasWithoutUpscale_ = function(canvas) {
  canvas.style.width = this.window_.innerWidth + 'px';
  canvas.style.height = this.window_.innerHeight + 'px';
  canvas.width = this.window_.innerWidth;
  canvas.height = this.window_.innerHeight;
};

Screen.prototype.resizeCanvas_ = function(canvas) {
  canvas.width = this.window_.innerWidth / this.upscale;
  canvas.height = this.window_.innerHeight / this.upscale;
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
