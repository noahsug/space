var MissionService = di.service('MissionService', [
  'GameModel as gm', 'ShipFactory', 'Gameplay']);

MissionService.prototype.start = function() {
  _.each(this.gm_.worlds, function(world) {
    _.each(world.missions, function(mission) {
      mission.state = mission.index ? 'locked' : 'unlocked';
      mission.maxLives = g.Lives.DEFAULT;
      this.initStages_(mission);
      this.resetProgress_(mission);
    }, this);
  }, this);
};

MissionService.prototype.initStages_ = function(mission) {
  _.each(mission.stages, function(row) {
    _.each(row, function(stage) {
      if (stage.empty) stage.state = 'won';
      else stage.enemy = this.shipFactory_.createEnemyDna(stage);
    }, this);
  }, this);
};

MissionService.prototype.resetProgress = function() {
  this.resetProgress_(this.gm_.mission);
};

MissionService.prototype.resetProgress_ = function(mission) {
  _.each(mission.stages, function(row) {
    _.each(row, this.resetStage_.bind(this));
  }, this);
  mission.lives = mission.maxLives;
};

MissionService.prototype.resetStage_ = function(stage) {
  if (stage.empty) return;
  stage.state = stage.row == 0 ? 'unlocked' : 'locked';
};

MissionService.prototype.unlockAdjacent = function(stage) {
  this.neighbors_(stage).forEach(function(neighbor) {
    if (neighbor.state == 'locked') neighbor.state = 'unlocked';
  }, this);
};

MissionService.prototype.won = function() {
  if (this.gm_.stage.row < this.gm_.mission.stages.length - 1) return false;
  return _.last(this.gm_.mission.stages).every(function(stage) {
    return stage.state == 'won';
  });
};

MissionService.prototype.lost = function() {
  return this.gm_.mission.lives <= 0;
};

MissionService.prototype.isValid_ = function(row, col) {
  return _.between(row, 0, this.gm_.mission.rows - 1) &&
      _.between(col, 0, this.gm_.mission.cols - 1);
};

MissionService.prototype.neighbors_ = function(stage) {
  if (stage.row == this.gm_.mission.stages.length - 1) return [];
  var row = this.gm_.mission.stages[stage.row];
  if (row.every(function(stage) { return stage.state != 'unlocked'; })) {
    return this.gm_.mission.stages[stage.row + 1];
  }
  return [];
};