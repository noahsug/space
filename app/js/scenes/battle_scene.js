var BattleScene = di.service('BattleScene', [
  'Scene', 'GameModel as gm', 'BattleRewards', 'ShipFactory',
  'EntityDecorator']);

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
  this.enemy_ = this.createEnemey_();
  this.player_ = this.shipFactory_.createPlayer();
  this.shipFactory_.setTargets(this.player_, this.enemy_);

  //DEBUG.
  //this.enemy_.dead = true;
};

BattleScene.prototype.createEnemey_ = function() {
  if (this.gm_.enemy == 'boss') {
    return this.shipFactory_.createBoss(this.gm_.level);
  }
  return this.shipFactory_.createRandomShip(this.gm_.level);
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
    this.gm_.results.won = !this.player_.dead;
    this.battleEnding_ = SLOWDOWN_TIME;
  }
};

BattleScene.prototype.freezeEntities_ = function() {
  for (var i = 0; i < this.gm_.entities.length; i++) {
    var entity = this.gm_.entities.arr[i];
    _.decorate(entity, this.d_.freeze);
  }
};

BattleScene.prototype.transitionOver_ = function() {
  this.removeEntities_();
  this.rewardPlayer_();
  this.goToNextDay_();
};

BattleScene.prototype.rewardPlayer_ = function() {
  this.gm_.results.earned = this.battleRewards_.getReward(this.gm_.results.won);
  if (this.gm_.results.earned.item) {
    this.gm_.inventory.push(this.gm_.results.earned.item);
  } else if (this.gm_.results.earned.stat) {
    var stat = this.gm_.results.earned.stat;
    this.gm_.playerStats[stat.name] += stat.value;
  }
};

BattleScene.prototype.goToNextDay_ = function() {
  if (!this.gm_.results.won && !this.gm_.daysLeft) {
    this.transition_('lost');
    return;
  }

  this.gm_.daysLeft--;
  this.gm_.daysOnLevel++;
  if (this.gm_.enemy == 'boss' && this.gm_.results.won) {
    if (this.gm_.level == Game.NUM_LEVELS - 1) {
      this.transition_('won');
    } else {
      this.gm_.level++;
      this.gm_.daysLeft += 11;
      this.gm_.daysOnLevel = 0;
    }
  }
};
