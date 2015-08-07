var MissionService = di.service('MissionService', [
  'GameModel as gm', 'ShipFactory', 'Gameplay', 'Inventory']);

MissionService.prototype.initWorlds = function(worlds) {
  _.each(worlds, function(world, worldIndex) {
    world.state = worldIndex == 0 ? 'unlocked' : 'locked';
    _.each(world.missions, function(mission, missionIndex) {
      mission.state = worldIndex + missionIndex == 0 ? 'unlocked' : 'locked';
      this.initStages_(mission.stages);
      this.resetProgress(mission);
    }, this);
  }, this);
};

MissionService.prototype.initStages_ = function(stages) {
  _.each2D(stages, function(stage) {
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
  var mission = opt_mission || this.gm_.mission;
  mission.state = 'unlocked';
  mission.fuel = mission.maxFuel;

  _.each2D(mission.stages, function(stage) {
    if (!stage.empty) {
      stage.state = stage.start ? 'unlocked' : 'locked';
    }
    stage.prevState = stage.state;
  }, this);
};

MissionService.prototype.selectWorld = function(world) {
  this.gm_.world = world;
  this.gm_.mission = this.getCurrentMission();
  this.resetProgress();
};

MissionService.prototype.getCurrentMission = function() {
  return _.find(this.gm_.world.missions, function(mission) {
    return _.oneOf(mission.state, 'unlocked', 'lost');
  });
};

MissionService.prototype.getPercentComplete = function(world) {
  var stats = _.countBy(world.missions, _.iteratee('state'));
  return 100 * (stats.won || 0) / world.missions.length;
};

MissionService.prototype.handleStageResult = function(result) {
  this.gm_.mission.fuel--;
  _.each2D(this.gm_.mission.stages, function(stage) {
    stage.prevState = stage.state;
  });
  this.gm_.stage.state = result;
  if (result == 'won') {
    if (this.gm_.stage.reward) {
      if (this.gm_.stage.reward.type == 'item') {
        this.inventory_.add(this.gm_.stage.reward.value);
      } else {  // type == 'world'
        this.gm_.stage.reward.value.state = 'unlocked';
      }
    }
    if (this.won_()) {
      this.gm_.mission.state = 'won';
      this.unlockNextMission_(this.gm_.mission);
    } else {
      this.unlockNextStages_(this.gm_.stage);
    }
  } else {  // lost
    this.lockStagesUntilCheckpoint_(this.gm_.stage);
  }
};

MissionService.prototype.unlockNextMission_ = function(mission) {
  var nextMission = this.gm_.missions[mission.index + 1];
  if (nextMission) nextMission.state = 'unlocked';
};

MissionService.prototype.unlockNextStages_ = function(stage) {
  _.each(this.gm_.stage.unlocks, function(stage) {
    if (stage.state == 'locked') stage.state = 'unlocked';
  }, this);
};

MissionService.prototype.lockStagesUntilCheckpoint_ = function(stage) {
  var prevStage;
  _.each2D(this.gm_.mission.stages, function(s) {
    if (s.unlocks.indexOf(stage) >= 0) prevStage = s;
  });
  if (!prevStage) return;
  if (prevStage.checkpoint) {
    stage.state = 'unlocked';
  } else {
    stage.state = 'locked';
    this.lockStagesUntilCheckpoint_(prevStage);
  }
};

MissionService.prototype.beatGame = function() {
  return _.every(this.gm_.worlds, function(world) {
    return this.getPercentComplete(world) == 100;
  }, this);
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
