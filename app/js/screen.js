var Screen = di.service('Screen', ['window', 'canvas']);

Screen.prototype.init = function() {
  console.log('init!');
  this.onResize();
};

Screen.prototype.setDesiredSurfaceArea = function(area) {
  this.desiredSurfaceArea_ = area;
};

Screen.prototype.onResize = function() {
  var upscale = this.getUpscaleRatio_();
  this.canvas_.width = this.window_.innerWidth_ * upscale;
  this.canvas_.height = this.window_.innerHeight_ * upscale;
  this.canvas_.style.width = this.window_.innerWidth;
  this.canvas_.style.height = this.window_.innerHeight;

  this.width = this.canvas_.width;
  this.height = this.canvas_.height;
};

Screen.prototype.getUpscaleRatio_ = function() {
  if (this.desiredSurfaceArea_) {
    var actualSurfaceArea = this.window_.innerHeight * this.window_.innerWidth;
    return Math.sqrt(this.desiredSurfaceArea_ / actualSurfaceArea);
  } else {
    return 1;
  }
};
