var GameModel = di.service('GameModel');

GameModel.prototype.init = function() {
  this.player = {};
  this.inventory = {};
  this.day = 1;

  this.entities = new List();
  this.scenes = {};

  this.enemy = {};
  this.results = {};
  this.equipping = '';
  this.transition = {done: true};
  this.gameSpeed = 1;
  this.time = 0;
  this.tick = 1;
};
