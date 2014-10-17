var Screen = di.service('Screen', ['window', 'canvas']);

Screen.prototype.init = function() {
  this.setDpi(1);
};

Screen.prototype.setDpi = function(dpi) {
  this.dpi_ = dpi;
  this.onResize();
};

Screen.prototype.onResize = function() {
  this.canvas_.width = this.window_.innerWidth / this.dpi_;
  this.canvas_.height = this.window_.innerHeight / this.dpi_;
  this.canvas_.style.width = this.window_.innerWidth + 'px';
  this.canvas_.style.height = this.window_.innerHeight + 'px';

  this.width = this.canvas_.width;
  this.height = this.canvas_.height;
};
