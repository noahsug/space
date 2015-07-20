var Debugger = di.service('Debugger', ['GameModel as gm', 'window']);

EXPERIMENT_1 = false;

Debugger.prototype.init = function() {
  if (PROD) return;
  this.window_.DEBUG = false;
  this.window_.addEventListener('keydown', function(e) {
    if (e.which == 32) this.window_.DEBUG = !this.window_.DEBUG;

    var num = e.which - 48;
    if (num == 0) num += 10;
    if (num < 5 || num > 10) return;
    num -= 5;
    this.gm_.gameSpeed = .01 + num * num / 8;
  }.bind(this));

  window.gm = this.gm_;

  this.window_.addEventListener('touchdown', toggleExperiment);
  this.window_.addEventListener('mousedown', toggleExperiment);
  function toggleExperiment() {
    EXPERIMENT_1 = !EXPERIMENT_1;
  }
};
