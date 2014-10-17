var Game = di.service('Game', ['GameModel as gm']);

Game.prototype.init = function() {
};

Game.prototype.update = function(dt) {
  this.gm_.player.x += this.gm_.player.speed * dt * Math.SQRT1_2;
  this.gm_.player.y += this.gm_.player.speed * dt * Math.SQRT1_2;
};
