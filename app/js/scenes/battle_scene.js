var BattleScene = di.service('BattleScene', [
  'Scene', 'GameModel as gm', 'gameplay', 'ShipFactory', 'EntityDecorator']);

var SLOWDOWN_TIME = 2;

BattleScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('battle'));
  this.d_ = this.entityDecorator_.getDecorators();
};

BattleScene.prototype.reset_ = function() {
  this.battleEnding_ = 0;
};

BattleScene.prototype.addEntities_ = function() {
  _.assert(!_.isEmpty(this.gm_.enemy), 'must have an enemy specified');
  this.enemy_ = this.shipFactory_.createBoss(this.gm_.enemy.boss);
  this.player_ = this.shipFactory_.createPlayer();
  this.shipFactory_.setTargets(this.player_, this.enemy_);
};

BattleScene.prototype.update_ = function(dt) {
  if (this.battleEnding_) {
    this.battleEnding_ -= dt / this.gm_.gameSpeed;
    if (this.battleEnding_ <= 0) {
      this.transition_('result');
      this.gm_.gameSpeed = 1;
      this.freezeEntities_();
    } else {
      this.gm_.gameSpeed =
          Math.max(.01, .25 * this.battleEnding_ / SLOWDOWN_TIME);
    }
  }

  else if (this.player_.dead || this.enemy_.dead) {
    if (!this.player_.dead) {
      this.gm_.results.won = true;
      this.rewardPlayer_();
    }
    this.battleEnding_ = SLOWDOWN_TIME;
  }
};

BattleScene.prototype.freezeEntities_ = function() {
  for (var i = 0; i < this.gm_.entities.length; i++) {
    var entity = this.gm_.entities.arr[i];
    _.decorate(entity, this.d_.freeze);
  }
};

BattleScene.prototype.rewardPlayer_ = function() {
  var level = this.gm_.level;
  if (Math.random() < .25 && level) level--;
  if (Math.random() < .25 && level) level--;
  this.gm_.results.earned = this.getRandomItem_(level);
  this.gm_.inventory.push(this.gm_.results.earned);
};

BattleScene.prototype.getRandomItem_ = function(level) {
  return _.sample(_.where(this.gameplay_.items, {level: level}));
};
