var Game = di.service('Game', ['GameModel as gm', 'Mouse']);

Game.prototype.init = function() {
  this.gm_.entities.push({x: 0, y: 0, radius: 10, type: 'player'});
  this.gm_.entities.push({x: 0, y: 0, type: 'splash'});
};

Game.prototype.update = function(dt) {
};
