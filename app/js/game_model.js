var GameModel = di.service('GameModel');

GameModel.prototype.init = function() {
  this.player = [];
  this.inventory = [];
  this.worlds = [];

  // The current world / mission / stage the player is on.
  this.world = {};
  this.event = {};
  this.mission = {};
  this.stage = {};

  // The state of every scene ("active", "inactive", "start" or "transition").
  this.scenes = {};
  // Info to pass from one scene to another about how it should start.
  this.config = {};
  // Ordered list of active scenes from back to front.
  this.sceneStack = [];
  this.entities = new List();

  this.gameSpeed = 1;
  this.time = 1;
  this.tick = 1;
  this.actTime = 1;
};
