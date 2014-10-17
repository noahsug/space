var Renderer = di.service('Renderer', ['GameModel as gm', 'canvas']);

Renderer.prototype.init = function() {
  this.ctx_ = this.canvas_.getContext('2d');
};

Renderer.prototype.update = function(dt) {
  this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
  this.ctx_.fillStyle = '#000000';
  this.ctx_.fillRect(this.gm_.player.x, this.gm_.player.y, 150,75);
};
