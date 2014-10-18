var Main = di.service('Main', [
  'Game', 'GameRunner', 'Mouse', 'Screen', 'window']);

Main.prototype.init = function() {
  this.window_.addEventListener(
      'resize', this.screen_.onResize.bind(this.screen_));

  this.window_.addEventListener(
      'blur', this.gameRunner_.stop.bind(this.gameRunner_));

  this.window_.addEventListener(
      'focus', this.gameRunner_.run.bind(this.gameRunner_));

  this.window_.addEventListener(
      'mousemove', this.mouse_.onMouseMove.bind(this.mouse_));

  this.window_.addEventListener(
      'mousedown', this.mouse_.onMouseDown.bind(this.mouse_));

  this.window_.addEventListener(
      'mouseup', this.mouse_.onMouseUp.bind(this.mouse_));

  this.gameRunner_.run();
};
