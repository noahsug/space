var GameModel = di.service('GameModel');

GameModel.prototype.init = function() {
  this.entities = {};
  this.rep = {};
  this.scenes = {};
  this.player = {};
};
