var GameModel = di.service('GameModel');

GameModel.prototype.init = function() {
  this.player = [];
  this.playerLevel = 0;
  this.inventory = [];
  this.world = [];
  this.level = {};

  this.entities = new List();
  this.scenes = {};

  this.gameSpeed = 1;
  this.time = 0;
  this.tick = 1;

  this.transition = {done: true};
  this.equipping = '';
};
