var Game = di.service('Game', [
  'GameModel as gm', 'IntroScene', 'BattleScene']);

Game.UPDATE_RATE = .06;

Game.prototype.start = function() {
  this.nextAction_ = 0;
  this.scenes_ = [this.introScene_, this.battleScene_];
  this.introScene_.start();
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
  if (dt > 0) {
    this.updateEntities_(dt);
  }
};

Game.prototype.entityAction_ = function(dt) {
  _.each(this.gm_.entities, function(e) { e.act(dt); });
  _.each(this.gm_.entities, function(e) { e.affect(dt); });
  _.each(this.gm_.entities, function(e) { e.resolve(dt); });
};
