var Main = di.service('Main', ['window', 'Screen', 'Game', 'GameRunner']);

Main.prototype.init = function() {
  this.window_.addEventListener(
      'resize', this.screen_.onResize.bind(this.screen_));

  this.window_.addEventListener(
      'blur', this.gameRunner_.stop.bind(this.gameRunner_));

  this.window_.addEventListener(
      'focus', this.gameRunner_.run.bind(this.gameRunner_));

  this.gameRunner_.run();
};
