var Game = di.service('Game', [
  'GameModel as gm', 'LoadingScene', 'IntroScene', 'BattleScene',
  'EquipScene', 'StageResultScene', 'MissionResultScene',
  'Gameplay', 'MissionService', 'BattleRewards', 'MissionSelectScene',
  'StageSelectScene', 'ShipDetailsScene', 'PrebattleScene']);

Game.UPDATE_RATE = .06;

Game.ITEM_TYPES = ['primary', 'secondary', 'ability', 'utility'];
Game.NUM_ITEMS = 4;
Game.MAX_ITEM_LEVEL = 5;
Game.MAX_LEVEL = (Game.MAX_ITEM_LEVEL + 1) * Game.ITEM_TYPES.length - 1;
// actual enemy level = (enemyLevel / MAX_ENEMY_LEVEL) * MAX_LEVEL
Game.MAX_ENEMY_LEVEL = 9;

Game.prototype.start = function() {
  this.nextAction_ = 0;
  this.initGameModel_();
  this.scenes_ = [
    // Modal dialogs go first to consume mouse clicks.
    /* 0 */ this.stageResultScene_,
    /* 1 */ this.missionResultScene_,
    /* 2 */ this.equipScene_,
    /* 3 */ this.shipDetailsScene_,

    /* 4 */ this.loadingScene_,
    /* 5 */ this.introScene_,
    /* 6 */ this.missionSelectScene_,
    /* 7 */ this.stageSelectScene_,
    /* 8 */ this.prebattleScene_,
    /* 9 */ this.battleScene_,
  ];

  // Select the tutorial mission and stage.
  this.gm_.mission = this.gm_.world.missions[0];
  this.gm_.stage = this.gm_.mission.stages[0][0];

  // DEBUG
  //this.gm_.mission = this.gm_.world.missions[0];
  //this.gm_.stage = this.gm_.mission.stages[0][0];
  //this.gm_.mission.lives = 0;
  //this.gm_.stage.state = 'won';
  //this.gm_.stage.state = 'lost';
  //this.gm_.equipping = 'primary';
  //this.gm_.mission.state = 'won';

  this.scenes_[4].start();
};

Game.prototype.initGameModel_ = function() {
  this.gm_.inventory = this.gameplay_.inventory;
  this.gm_.player = this.gameplay_.player;
  this.gm_.worlds = this.gameplay_.worlds;
  this.missionService_.start();
  this.gm_.world = this.gm_.worlds[0];
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
