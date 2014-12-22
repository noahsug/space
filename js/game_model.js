var GameModel = di.service('GameModel');

GameModel.prototype.init = function() {
  this.entities = new List();
  this.scenes = {};
  this.player = {};
  this.results = {};
  this.level = 0;
  this.speed = 1;
};
