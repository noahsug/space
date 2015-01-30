var GameModel = di.service('GameModel');

GameModel.prototype.init = function() {
  this.player = [];
  this.inventory = [];
  this.playerStats = {
    dmg: 0,
    speed: 0,
    health: 0,
    def: 0
  };
  this.daysLeft = 10;
  this.daysOnLevel = 0;
  this.level = 0;

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