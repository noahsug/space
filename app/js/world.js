var World = di.service('World', [
  'GameModel as gm', 'ShipFactory', 'Gameplay']);

World.prototype.initWorlds = function() {
  _.each(this.gm_.worlds, function(world) {
    this.gm_.world = world;
    world.state = world.index ? 'locked' : 'unlocked';
    world.maxLives = world.lives || 0;
    this.initStages_(world);
    this.resetProgress();
  }, this);
};

World.prototype.initStages_ = function(world) {
  _.each(world.stages, function(row) {
    _.each(row, function(stage) {
      stage.enemy = this.shipFactory_.createEnemyDna(stage);
      if (stage.end) world.end = stage;
    }, this);
  }, this);
};

World.prototype.resetProgress = function() {
  _.each(this.gm_.world.stages, function(row) {
    _.each(row, function(stage) {
      this.initStage_(stage);
    }, this);
  }, this);
  this.gm_.world.augments = [];
  this.gm_.world.aquired = [];
  this.gm_.world.lives = this.gm_.world.maxLives;
};

World.prototype.initStage_ = function(stage) {
  stage.state = stage.row == 0 ? 'unlocked' : 'locked';
  var rand = Math.random();
  if (rand < stage.reward.item) {
    stage.hasItem = true;
  } else if (rand < stage.reward.item + stage.reward.augment) {
    stage.hasAugment = true;
  }
};

World.prototype.unlockAdjacent = function(stage) {
  this.neighbors_(stage).forEach(function(neighbor) {
    if (neighbor.state == 'locked') neighbor.state = 'unlocked';
  }, this);
};

World.prototype.won = function() {
  return this.gm_.world.end.state == 'won';
};

World.prototype.lost = function() {
  if (this.gm_.world.lives > 0) return false;
  return this.gm_.world.stages.every(function(row) {
    return row.every(function(stage) { return stage.state != 'unlocked'; });
  });
};

World.prototype.isValid_ = function(row, col) {
  return _.between(row, 0, this.gm_.world.rows - 1) &&
      _.between(col, 0, this.gm_.world.cols - 1);
};

World.prototype.neighbors_ = function(stage) {
  if (stage.row == this.gm_.world.stages.length - 1) return [];
  var row = this.gm_.world.stages[stage.row];
  if (row.every(function(stage) { return stage.state != 'unlocked'; })) {
    return this.gm_.world.stages[stage.row + 1];
  }
  return [];
};
