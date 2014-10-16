var Main = di.service('Main', ['window', 'Screen', 'Game', 'GameRunner']);

Main.prototype.init = function() {
  this.screen_.setDesiredSurfaceArea(800);

  this.window_.addEventListener('resize', function() {
    this.screen_.onResize();
    this.game_.resize(this.screen_.width, this.screen_.height);
  }.bind(this));

  this.window_.addEventListener('blur', function() {
    this.gameRunner_.stop();
  });

  this.window_.addEventListener('focus', function() {
    this.gameRunner_.run();
  });

  this.gameRunner_.run();
};
