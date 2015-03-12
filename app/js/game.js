var Game = di.service('Game', [
  'GameModel as gm', 'LoadingScene', 'IntroScene', 'BattleScene', 'MainScene',
  'EquipOptionsScene', 'EquipScene', 'ResultScene', 'WonScene', 'LostScene',
  'Gameplay', 'World']);

Game.UPDATE_RATE = .06;
Game.MAX_LEVEL = 7;

Game.prototype.start = function() {
  this.nextAction_ = 0;
  this.setPlayerItems_();
  this.world_.create();
  this.scenes_ = [
    /* 0 */ this.loadingScene_,
    /* 1 */ this.introScene_,
    /* 2 */ this.mainScene_,
    /* 3 */ this.battleScene_,
    /* 4 */ this.resultScene_,
    /* 5 */ this.equipOptionsScene_,
    /* 6 */ this.equipScene_,
    /* 7 */ this.wonScene_,
    /* 8 */ this.lostScene_
  ];

  // DEBUG
  this.gm_.level = this.gm_.world[0];
  //this.gm_.level.results = 'won';
  //this.gm_.level.earned = {item: _.value(this.gameplay_.items)};

  this.scenes_[5].start();
};

Game.prototype.setPlayerItems_ = function() {
  this.gm_.inventory = this.gameplay_.inventory;
  this.gm_.player = this.gameplay_.player;
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
