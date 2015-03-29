var GameModel = di.service('GameModel');

GameModel.prototype.init = function() {
  this.player = [];
  this.inventory = [];
  this.worlds = [];

  this.world = {};
  this.level = {};

  this.entities = new List();
  this.scenes = {};

  this.gameSpeed = 1;
  this.time = 0;
  this.tick = 1;

  this.transition = {done: true};
  this.equipping = '';
};
