var GameModel = di.service('GameModel');

GameModel.prototype.init = function() {
  this.player = {};
  this.inventory = {};
  this.progress = 0;

  this.entities = new List();
  this.scenes = {};

  this.enemy = {};
  this.results = {};
  this.transition = null;
  this.gameSpeed = 1;
  this.time = 0;
  this.tick = 1;
};
