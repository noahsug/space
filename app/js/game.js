var Game = di.service('Game', [
  'GameModel as gm', 'IntroScene', 'BattleScene', 'EquipScene', 'gameplay']);

Game.UPDATE_RATE = .06;

Game.prototype.start = function() {
  this.nextAction_ = 0;
  this.setPlayerItems_();
  this.scenes_ = [this.introScene_, this.battleScene_, this.equipScene_];
  //this.introScene_.start();
  this.battleScene_.start();
  //this.equipScene_.start();
};

Game.prototype.setPlayerItems_ = function() {
  this.gm_.player.inventory = this.gameplay_.init.inventory;
  this.gm_.player.spec = this.gameplay_.init.player;
};

Game.prototype.update = function(dt) {
  this.updateEntities_(dt);
  _.each(this.scenes_, function(scene) { scene.update(dt); });
  if (this.gm_.scenes['battle'] == 'start') {
    this.nextAction_ = 0;
  }
  _.each(this.scenes_, function(scene) { scene.resolve(dt); });
};

Game.prototype.updateEntities_ = function(dt) {
  var updateTime = Math.min(dt, this.nextAction_);
  if (updateTime > 0) {
    _.each(this.gm_.entities, function(e) { e.update(updateTime); });
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
  _.each(this.gm_.entities, function(e) { e.act(dt); });
  _.each(this.gm_.entities, function(e) { e.affect(dt); });
  _.each(this.gm_.entities, function(e) { e.resolve(dt); });
};
