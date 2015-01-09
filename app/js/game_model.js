var GameModel = di.service('GameModel');

GameModel.prototype.init = function() {
  this.player = {};
  this.results = {};
  this.level = 0;

  this.entities = new List();
  this.scenes = {};

  this.transition = null;
  this.speed = 1;
  this.time = 0;
  this.tick = 1;
};
