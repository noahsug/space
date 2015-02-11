var Debugger = di.service('Debugger', ['GameModel as gm', 'window']);

Debugger.prototype.init = function() {
  this.window_.DEBUG = false;
  this.window_.addEventListener('keydown', function(e) {
    if (e.which == 32) this.window_.DEBUG = !this.window_.DEBUG;

    var num = e.which - 48;
    if (num > 9 || num < 0) return;
    this.gm_.gameSpeed = .01 + num * num / 16;
  }.bind(this));
};
