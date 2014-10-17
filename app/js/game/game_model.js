var GameModel = di.service('GameModel');

GameModel.prototype.init = function() {
  this.player = {x: 0, y: 0, speed: 50};
};
