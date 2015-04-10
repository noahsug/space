var Game = di.service('Game', [
  'GameModel as gm', 'LoadingScene', 'IntroScene', 'BattleScene', 'MainScene',
  'EquipOptionsScene', 'EquipScene', 'ResultScene', 'WonScene', 'LostScene',
  'Gameplay', 'World', 'BattleRewards', 'WorldSelectScene']);

Game.UPDATE_RATE = .06;

Game.ITEM_TYPES = ['primary', 'secondary', 'ability', 'utility'];
Game.MAX_ITEM_LEVEL = 5;
Game.MAX_LEVEL = (Game.MAX_ITEM_LEVEL + 1) * Game.ITEM_TYPES.length - 1;

Game.prototype.start = function() {
  this.nextAction_ = 0;
  this.initGameModel_();
  this.scenes_ = [
    /* 0 */ this.loadingScene_,
    /* 1 */ this.introScene_,
    /* 2 */ this.worldSelectScene_,
    /* 3 */ this.mainScene_,
    /* 4 */ this.equipOptionsScene_,
    /* 5 */ this.equipScene_,
    /* 6 */ this.battleScene_,
    /* 7 */ this.resultScene_,
    /* 8 */ this.wonScene_,
    /* 9 */ this.lostScene_
  ];

  // DEBUG
  this.gm_.world = this.gm_.worlds[0];
  this.gm_.level = this.gm_.world.levels[0];
  //this.gm_.level.state = 'won';
  this.battleRewards_.calculateRewards();
  this.gm_.equipping = 'primary';

  this.scenes_[6].start();
};

Game.prototype.initGameModel_ = function() {
  this.gm_.inventory = this.gameplay_.inventory;
  this.gm_.player = this.gameplay_.player;
  this.gm_.worlds = this.gameplay_.worlds;
  this.world_.createWorlds();
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
