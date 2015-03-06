var GameModel = di.service('GameModel');

GameModel.prototype.init = function() {
  this.player = [];
  this.inventory = [];
  this.level = 0;
  this.lives = 3;

  this.entities = new List();
  this.scenes = {};

  this.gameSpeed = 1;
  this.time = 0;
  this.tick = 1;

  this.enemy = {};
  this.transition = {done: true};
  this.results = {};
  this.equipping = '';
};
