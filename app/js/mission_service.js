var MissionService = di.service('MissionService', [
  'GameModel as gm', 'ShipFactory', 'Gameplay', 'Inventory']);

MissionService.prototype.initWorlds = function(worlds) {
  _.each(worlds, function(world, worldIndex) {
    world.state = worldIndex == 0 ? 'unlocked' : 'locked';
    _.each(world.missions, function(mission, missionIndex) {
      mission.state = worldIndex + missionIndex == 0 ? 'unlocked' : 'locked';
      this.initStages_(mission);
    }, this);
  }, this);
};

MissionService.prototype.initStages_ = function(mission) {
  _.each2D(mission.stages, function(stage) {
    if (stage.empty) {
      stage.state = 'won';
    } else {
      stage.ship = this.shipFactory_.createEnemyDna(stage.ship);
      stage.state = stage.start ? 'unlocked' : 'locked';
    }
    stage.prevState = stage.state;
  }, this);
};

MissionService.prototype.resetProgress = function(opt_mission) {
  this.initStages_(opt_mission || this.gm_.mission);
};

MissionService.prototype.handleStageResult = function(result) {
  _.each2D(this.gm_.mission.stages, function(stage) {
    stage.prevState = stage.state;
  });
  if (result == 'won') {
    if (this.gm_.stage.reward) {
      if (this.gm_.stage.reward.type == 'item') {
        this.inventory_.add(this.gm_.stage.reward.value);
      }
    }
    this.gm_.stage.state = 'won';
    if (this.won_()) {
      this.gm_.mission.state = 'won';
    } else {
      this.unlockNextStages_(this.gm_.stage);
    }
  } else {
    this.lockStagesUntilCheckpoint_(this.gm_.stage);
  }
};

MissionService.prototype.unlockNextStages_ = function(stage) {
  _.each(this.gm_.stage.unlocks, function(stage) {
    if (stage.state == 'locked') stage.state = 'unlocked';
  }, this);
};

MissionService.prototype.lockStagesUntilCheckpoint_ = function(stage) {
};

MissionService.prototype.beatGame = function() {
  return this.gm_.mission.state == 'won';
};

MissionService.prototype.won_ = function() {
  var won = true;
  _.each2D(this.gm_.mission.stages, function(stage) {
    won &= stage.state == 'won';
  });
  return won;
};

MissionService.prototype.getStartingStage = function() {
  var start;
  _.each2D(this.gm_.mission.stages, function(stage) {
    if (stage.start) {
      start = stage;
      return;
    }
  });
  return _.assert(start);
};
