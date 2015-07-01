var MissionService = di.service('MissionService', [
  'GameModel as gm', 'ShipFactory', 'Gameplay']);

MissionService.prototype.start = function() {
  _.each(this.gm_.worlds, function(world) {
    _.each(world.events, function(event) {
      event.state = 'locked';
      _.each(event.missions, function(mission) {
        mission.maxLives = mission.maxLives || g.Lives.DEFAULT;
        this.initStages_(mission);
        this.resetProgress_(mission);
      }, this);
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

MissionService.prototype.handleStageResult = function(result) {
  if (result == 'lost') {
    this.gm_.mission.lives--;
    if (this.gm_.mission.lives < 0) this.gm_.event.state = 'lost';
  } else {
    this.gm_.stage.state = 'won';
    if (this.won_()) {
      this.gm_.event.state = 'won';
    } else {
      this.unlockAdjacent_(this.gm_.stage);
    }
  }
};

MissionService.prototype.handleMissionResult = function() {
  if (this.gm_.event.state == 'lost') {
    this.gm_.event.state = 'unlocked';
    this.resetProgress_(this.gm_.mission);
  } else if (this.gm_.event.state == 'won') {
    _.forEach(this.gm_.mission.unlocks, function(i) {
      if (this.gm_.world.events[i].state == 'locked') {
        this.gm_.world.events[i].state = 'unlocked';
      }
    }, this);
  }
};

MissionService.prototype.unlockAdjacent_ = function(stage) {
  this.neighbors_(stage).forEach(function(neighbor) {
    neighbor.state = 'unlocked';
  }, this);
};

MissionService.prototype.beatGame = function() {
  return this.gm_.event.index == this.gm_.world.events.length - 1 &&
      this.gm_.event.state == 'won';
};

MissionService.prototype.won_ = function() {
  if (this.gm_.stage.row < this.gm_.mission.stages.length - 1) return false;
  return _.last(this.gm_.mission.stages).every(function(stage) {
    return stage.state == 'won';
  });
};

MissionService.prototype.isValid_ = function(row, col) {
  return _.between(row, 0, this.gm_.mission.rows - 1) &&
      _.between(col, 0, this.gm_.mission.cols - 1);
};

// Returns next row of ships of current row is defeated.
MissionService.prototype.neighbors_ = function(stage) {
  if (stage.row == this.gm_.mission.stages.length - 1) return [];
  var row = this.gm_.mission.stages[stage.row];
  if (row.every(function(stage) { return stage.state != 'unlocked'; })) {
    return this.gm_.mission.stages[stage.row + 1];
  }
  return [];
};
