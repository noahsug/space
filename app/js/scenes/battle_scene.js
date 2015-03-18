var BattleScene = di.service('BattleScene', [
  'Scene', 'GameModel as gm', 'ShipFactory', 'EntityDecorator', 'World']);

var SLOWDOWN_TIME = 2;

BattleScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('battle'));
  this.d_ = this.entityDecorator_.getDecorators();
};

BattleScene.prototype.start_ = function() {
  this.battleEnding_ = 0;
};

BattleScene.prototype.addEntities_ = function() {
  _.assert(!_.isEmpty(this.gm_.enemy), 'must have an enemy specified');
  this.enemy_ = this.shipFactory_.createEnemy();
  this.player_ = this.shipFactory_.createPlayer();
  this.shipFactory_.setTargets(this.player_, this.enemy_);

  //DEBUG.
  //this.enemy_.dead = true;
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

  else {
    this.player_ = this.player_.getLivingClone();
    this.enemy_ = this.enemy_.getLivingClone();
    if (this.player_.dead || this.enemy_.dead) {
      this.gm_.level.state = this.player_.dead ? 'lost' : 'won';
      this.battleEnding_ = SLOWDOWN_TIME;
    }
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
  this.gm_.level.state == 'won' ? this.handleWin_() : this.handleLoss_();
};

BattleScene.prototype.handleWin_ = function() {
  if (this.world_.won()) {
    this.transition_('won');
  } else {
    this.world_.unlockAdjacent(this.gm_.level);
  }
};

BattleScene.prototype.handleLoss_ = function() {
  if (this.world_.lost()) this.transition_('lost');
};
