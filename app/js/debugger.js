var Debugger = di.service('Debugger', ['GameModel as gm', 'window']);

Debugger.prototype.init = function() {
  this.window_.addEventListener('keydown', function(e) {
    var num = e.which - 48;
    if (num > 9 || num < 0) return;
    if (num == 0) this.gm_.gameSpeed = .01;
    else this.gm_.gameSpeed = 5 / num;
  }.bind(this));
};
