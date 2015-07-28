var Game = di.service('Game', [
  'GameModel as gm', 'LoadingScene', 'IntroScene', 'BattleScene',
  'StageResultScene', 'Gameplay', 'MissionService',
  'StageSelectScene', 'PrebattleScene']);

Game.UPDATE_RATE = .06;

Game.ITEM_TYPES = ['primary', 'secondary', 'ability', 'utility'];
Game.NUM_ITEMS = Game.ITEM_TYPES.length;

Game.prototype.start = function() {
  this.nextAction_ = 0;
  this.initGameModel_();
  this.scenes_ = [
    // Modal dialogs go first to consume mouse clicks.
    /* 0 */ this.stageResultScene_,

    /* 1 */ this.loadingScene_,
    /* 2 */ this.introScene_,
    /* 3 */ this.stageSelectScene_,
    /* 4 */ this.prebattleScene_,
    /* 5 */ this.battleScene_,
  ];

  // DEBUG
  //this.gm_.stage = this.gm_.stage.unlocks[0];
  //this.gm_.stage.state = 'won';
  //this.gm_.equipping = 'primary';
  this.missionService_.handleStageResult('won');

  this.scenes_[0].start();
};

Game.prototype.initGameModel_ = function() {
  this.gm_.player = this.gameplay_.player;
  this.gm_.inventory = this.gameplay_.inventory.concat(
      _.clone(this.gm_.player));
  this.gm_.worlds = this.gameplay_.worlds;
  this.missionService_.initWorlds(this.gm_.worlds);

  this.gm_.world = this.gm_.worlds[0];
  this.gm_.mission = this.gm_.world.missions[0];
  this.gm_.stage = this.missionService_.getStartingStage();
};

Game.prototype.update = function(dt) {
  this.updateEntities_(dt);
  for (var i = 0; i < this.scenes_.length; i++) {
    this.scenes_[i].update(dt);
  }
  if (this.gm_.scenes['battle'] == 'start') {
    this.nextAction_ = 0;
  }
  for (var i = 0; i < this.scenes_.length; i++) {
    this.scenes_[i].resolve(dt);
  }
};

Game.prototype.updateEntities_ = function(dt) {
  var updateTime = Math.min(dt, this.nextAction_);
  if (updateTime > 0) {
    this.gm_.time += updateTime;
    for (var i = 0; i < this.gm_.entities.length; i++) {
      this.gm_.entities.arr[i].update(updateTime);
    }
    dt -= updateTime;
    this.nextAction_ -= updateTime;
  }
  if (this.nextAction_ == 0) {
    this.entityAction_(Game.UPDATE_RATE);
    this.nextAction_ = Game.UPDATE_RATE;
  }
  if (dt > 0 && (dt > .002 || this.nextAction_ <= dt)) {
    this.updateEntities_(dt);
  }
};

Game.prototype.entityAction_ = function(dt) {
  this.gm_.actTime = this.gm_.time;
  this.gm_.tick++;
  for (var i = 0; i < this.gm_.entities.length; i++) {
    this.gm_.entities.arr[i].act(dt);
  }
  for (var i = 0; i < this.gm_.entities.length; i++) {
    this.gm_.entities.arr[i].affect(dt);
  }
  for (var i = 0; i < this.gm_.entities.length; i++) {
    this.gm_.entities.arr[i].resolve(dt);
  }
  for (var i = 0; i < this.gm_.entities.length; i++) {
    if (this.gm_.entities.arr[i].remove) {
      this.gm_.entities.remove(i);
      i--;
    }
  }
};
