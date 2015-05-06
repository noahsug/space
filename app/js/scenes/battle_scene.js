var BattleScene = di.service('BattleScene', [
  'Scene', 'GameModel as gm', 'ShipFactory', 'EntityDecorator', 'World',
  'BattleRewards', 'LayoutElement', 'RoundBtnElement', 'Inventory', 'Mouse']);

var SLOWDOWN_TIME = 2;

BattleScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('battle'));
  this.d_ = this.entityDecorator_.getDecorators();
};

BattleScene.prototype.start_ = function() {
  this.battleEnding_ = 0;
};

BattleScene.prototype.addEntities_ = function() {
  this.enemy_ = this.shipFactory_.createEnemy();
  this.player_ = this.shipFactory_.createPlayer();
  this.shipFactory_.setTargets(this.player_, this.enemy_);

  // Items
  this.layout_ = this.layoutElement_.create({direction: 'vertical'});
  this.layout_.addFlex(1);
  var COLS = 4;
  var row;
  _.each(Game.ITEM_TYPES, function(type, i) {
    var pos = i % COLS;
    // Gap between rows.
    if (pos == 0 && i) this.layout_.addGap(Padding.ITEM);
    // New row.
    if (pos == 0) {
      row = this.layout_.addNew(this.layoutElement_);
      row.childHeight = Size.ITEM;
    }
    // Gap between btns.
    if (pos) row.addGap(Padding.ITEM);
    // The btn.
    row.add(this.createItemButton_(type, i));
  }, this);
  this.layout_.addGap(Padding.ITEM);

  //DEBUG.
  //this.enemy_.dead = true;
};

BattleScene.prototype.createItemButton_ = function(type, index) {
  var btn = this.roundBtnElement_.create();
  btn.setSize(Size.ITEM);
  btn.setProp('item', this.inventory_.getEquipped(type) || {category: type});
  if (this.inventory_.getEquipped(type)) {
    btn.setProp('cooldownInfo', this.player_[type]);
    btn.getEntity().update(function() {
      if (this.player_[type].use) return;
      this.player_[type].use =
          btn.getEntity().mouseDown || this.mouse_.keysPressed[index];
    }, this);
    btn.getEntity().resolve(function() {
      this.player_[type].use = false;
    }, this);
  }
  return btn;
};

BattleScene.prototype.update_ = function(dt) {
  this.layout_.update();
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
      if (!this.player_.dead) this.gm_.stage.state = 'won';
      else this.gm_.world.lives--;
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
  this.gm_.stage.state == 'won' ? this.handleWin_() : this.handleLoss_();
  this.gm_.equipping = null;
};

BattleScene.prototype.handleWin_ = function() {
  this.battleRewards_.calculateRewards();
  this.world_.unlockAdjacent(this.gm_.stage);
};

BattleScene.prototype.handleLoss_ = function() {
  if (this.world_.lost()) this.transition_('lost');
};
