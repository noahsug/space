var Game = di.service('Game', ['GameModel as gm', 'Mouse']);

Game.prototype.init = function() {
};

Game.prototype.update = function(dt) {
  var player = this.gm_.player;
  player.x = this.mouse_.x;
  player.y = this.mouse_.y;
  player.attacking = this.mouse_.down;
  player.attackStart = this.mouse_.pressed;
  player.attackEnd = this.mouse_.released;
};
