var BattleScene = di.service('BattleScene', [
  'Scene', 'GameModel as gm', 'ShipFactory', 'EntityDecorator',
  'MissionService', 'LayoutElement', 'ItemElement', 'EntityElement',
  'Inventory', 'Mouse']);

var SLOWDOWN_TIME = 2;

BattleScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'battle');
  this.d_ = this.entityDecorator_.getDecorators();
};

BattleScene.prototype.onStart_ = function() {
  this.battleState_ = 'active';
};

BattleScene.prototype.addEntities_ = function() {
  this.enemy_ = this.shipFactory_.createEnemy();
  this.player_ = this.shipFactory_.createPlayer();
  this.shipFactory_.setTargets(this.player_, this.enemy_);
  this.player_.awake();
  this.enemy_.awake();

  // Items
  this.layout_ = this.LayoutElement_.new('vertical')
    .add(this.EntityElement_.new('healthBars')
      .setProp('player', this.player_)
      .setProp('enemy', this.enemy_))
    .setPadding(Padding.MARGIN)
    .setChildrenBaseline('bottom')
    .add(this.LayoutElement_.new('horizontal')
      .setLayoutFill(true)
      .modify(this.addItems_, this))
    .setAlpha(0)
    .animate('alpha', 1);

  //DEBUG: End the battle immediately.
  //this.enemy_.dead = true;
  //this.player_.dead = true;
};

BattleScene.prototype.addItems_ = function(layout) {
  _.each(Game.ITEM_TYPES, function(type, i) {
    if (i) layout.addFlex();
    layout.add(this.createItem_(type, i));
  }, this);
};

BattleScene.prototype.createItem_ = function(type, index) {
  var btn = this.ItemElement_.new();
  var item = this.inventory_.getEquipped(type) || {};
  btn.setSize(Size.ITEM);

  if (item.category) {
    btn.setProp('item', item);
    btn.setProp('cdInfo', this.player_[type]);
    this.addInputHandler_(btn, index);
  } else {
    btn.setStyle('hidden');
  }
  return btn;
};

BattleScene.prototype.addInputHandler_ = function(btn, index) {
  btn.getEntity().update(function() {
    var spec = this.player_[btn.getProp('item').category];
    if (spec.use) return;
    spec.use = btn.mouseDown || this.mouse_.keysPressed[index];
  }, this);
  btn.getEntity().resolve(function() {
    var spec = this.player_[btn.getProp('item').category];
    spec.use = false;
  }, this);
};

BattleScene.prototype.update_ = function(dt) {
  if (this.battleState_ != 'background') {
    this.layout_.update(dt);
  }
  if (this.battleState_ == 'active') {
    this.handleActiveState_();
  }
  if (this.battleState_ == 'ending') {
    this.handleEndingState_(dt);
  }
};

BattleScene.prototype.handleActiveState_ = function() {
  this.player_ = this.player_.getLivingClone();
  this.enemy_ = this.enemy_.getLivingClone();
  if (this.player_.dead || this.enemy_.dead) this.startEndingState_();
};

BattleScene.prototype.startEndingState_ = function() {
  this.battleState_ = 'ending';
  this.transition_ = SLOWDOWN_TIME;
  this.missionService_.handleStageResult(this.player_.dead ? 'lost' : 'won');
};

BattleScene.prototype.handleEndingState_ = function(dt) {
  this.transition_ -= dt / this.gm_.gameSpeed;
  this.gm_.gameSpeed = Math.max(.01, .25 * this.transition_ / SLOWDOWN_TIME);
  if (this.transition_ <= 0) this.startBackgroundState_();
};

BattleScene.prototype.startBackgroundState_ = function() {
  this.battleState_ = 'background';
  this.freezeEntities_();
  this.gm_.gameSpeed = 1;
  this.openModal_('stageResult');
};

BattleScene.prototype.freezeEntities_ = function() {
  for (var i = 0; i < this.gm_.entities.length; i++) {
    var entity = this.gm_.entities.arr[i];
    _.decorate(entity, this.d_.freeze);
  }
};
