var Game = di.service('Game', [
  'GameModel as gm', 'Scene', 'IntroScene', 'BattleScene', 'EquipScene',
  'ResultScene', 'gameplay']);

Game.UPDATE_RATE = .06;

Game.prototype.start = function() {
  this.nextAction_ = 0;
  this.setPlayerItems_();
  this.scenes_ = [
    this.introScene_,
    this.battleScene_,
    this.resultScene_,
    this.equipScene_
  ].map(this.scene_.create.bind(this.scene_));

  //this.gm_.results.won = true;
  //this.gm_.results.earned = _.value(this.gameplay_.items);

  this.scenes_[1].start();
};

Game.prototype.setPlayerItems_ = function() {
  this.gm_.player.inventory = this.gameplay_.init.inventory;
  this.gm_.player.spec = this.gameplay_.init.player;
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
