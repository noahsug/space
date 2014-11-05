var GameModel = di.service('GameModel');

GameModel.prototype.init = function() {
  this.entities = {};
  this.scenes = {};
  this.rep = {};
};
