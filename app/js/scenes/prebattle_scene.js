var PrebattleScene = di.service('PrebattleScene', [
  'Scene', 'LayoutElement', 'LabelElement', 'EntityElement', 'Inventory',
  'Screen', 'UiElement', 'GameModel as gm', 'SpriteService', 'ItemService',
  'ItemDescElement']);

PrebattleScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'prebattle');
};

PrebattleScene.prototype.onStart_ = function() {
  this.tutorial_ = this.gm_.world.index + this.gm_.mission.index == 0 &&
      this.gm_.stage.start;
  if (this.tutorial_) {
    // Player + Enemy fly in slowly.
    this.FLY_TIME = 3;
    this.timeToTransition_ = this.FLY_TIME * 2;
    this.startBattle_ = true;
  } else {
    // Player flies in quickly.
    this.FLY_TIME = 1.5;
    this.timeToTransition_ = this.FLY_TIME;
  }
};

PrebattleScene.prototype.addEntities_ = function() {
  this.addShipEntities_();
  if (!this.tutorial_) this.addUiEntities_();
};

PrebattleScene.prototype.addShipEntities_ = function() {
  this.shipLayout_ = this.LayoutElement_.new('vertical')
    .setChildrenBaselineAlign('middle', 'center')
    .setChildrenFill(true)

    // Enemy
    .add(this.EntityElement_.new('shipElement')
      .setSize(0)
      .setProp('rotation', Math.PI / 2)
      .setProp('hull', _.findWhere(this.gm_.stage.ship, {category: 'hull'}))
      .modify(this.maybeFlyDown_, this))

    // Gap
    .addGap(200)

    // Player
    .add(this.EntityElement_.new('shipElement')
      .setSize(0)
      .setProp('rotation', -Math.PI / 2)
      .setProp('hull', this.inventory_.getHull())
      .setOffset(0, this.screen_.height / 2 - 75)
      .animate('y', 0, {duration: this.FLY_TIME}));
};

PrebattleScene.prototype.maybeFlyDown_ = function(enemy) {
  if (!this.tutorial_) return;
  enemy
    .setOffset(0, -(this.screen_.height / 2 - 75))
    .animate('y', 0, {delay: this.FLY_TIME, duration: this.FLY_TIME});
};

PrebattleScene.prototype.addUiEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .setChildrenFill(true)
    .setPadding(Padding.MARGIN)

    // Enemy items
    .add(this.LayoutElement_.new('horizontal')
      .modify(this.addEnemyItems_, this))

    .addGap(Padding.MARGIN)

    // Enemy item desc
    .modify(this.addItemDesc_.bind(this, 'enemy'))

    .addFlex()

    // Player item desc
    .modify(this.addItemDesc_.bind(this, 'player'))

    .addGap(Padding.MARGIN * .6)

    // Player inventory
    .modify(this.addPlayerInventory_, this)

    .addGap(Padding.MARGIN)

    .add(this.LayoutElement_.new('horizontal')
      // Back
      .add(this.LabelElement_.new()
        .setText('back', Size.BUTTON)
        .setBg('primary', Padding.BUTTON_BG)
        .onClick(this.back_, this))
      .addFlex()
      // Equip
      .add(this.equipBtn_ = this.LabelElement_.new()
        .setText('equipment', Size.BUTTON)
        .setBg('primary', Padding.BUTTON_BG)
        .onClick(this.toggleEquip_, this))
      .addGap(Padding.BUTTON)
      // Fight
      .add(this.LabelElement_.new()
        .setText('engage', Size.BUTTON)
        .setStyle('active')
        .setBg('primary', Padding.BUTTON_BG)
        .onClick(this.fight_, this)));

  this.fadeFromBlack_();
};

PrebattleScene.prototype.addItemDesc_ = function(name, layout) {
 var itemDesc = this.ItemDescElement_.new('vertical')
   .setLayoutAlign('center')
   .setPadding(Padding.MODAL_MARGIN_SM)
   .setBgStyle('muted_dark')
   .setBorderStyle('primary');

 layout.add(itemDesc);

  this[name + 'ItemDesc_'] = itemDesc;
};

PrebattleScene.prototype.addEnemyItems_ = function(layout) {
  // Show used items first.
  var items = _.sortBy(Game.ITEM_TYPES, function(type, i) {
    return !this.itemService_.getEnemyEquipped(type) * 10 + i;
  }, this);

  _.each(items, function(type, i) {
    if (i) layout.addFlex();
    var item = this.itemService_.getEnemyEquipped(type);
    layout.add(this.createItemBtn_(item)
      .onClick(function(btn) {
        this.selectedEnemyBtn_ = this.selectedEnemyBtn_ == btn ?
            undefined : btn;
        this.enemyItemDesc_.setItem(this.selectedEnemyBtn_ && item);
      }, this));
  }, this);
};

PrebattleScene.prototype.addPlayerInventory_ = function(layout) {
  this.playerBtns_ = [];

  this.playerInventory_ = this.LayoutElement_.new('horizontal')
    .setLayoutAlign('center')
    .setPadding(Padding.MODAL_MARGIN_SM)
    .setBgStyle('muted_dark')
    .setBorderStyle('primary')
    .modify(this.addPlayerItemCols_, this)
    .setAlpha(0);

  layout.add(this.playerInventory_);
  this.updatePlayerBtnStyles_();
};

PrebattleScene.prototype.addPlayerItemCols_ = function(layout) {
  _.each(Game.ITEM_TYPES, function(type, i) {
    if (i) layout.addGap(Padding.ITEM);
    layout.add(this.LayoutElement_.new('vertical')
      .setChildrenBaseline('bottom')
      .modify(this.addPlayerItemCol_.bind(this, type)));
  }, this);
};

PrebattleScene.prototype.addPlayerItemCol_ = function(type, layout) {
  var items = this.inventory_.get(type);
  _.each(items, function(item, i) {
    layout
      .add(this.createPlayerItemBtn_(item))
      .addGap(Padding.ITEM / 2);
  }, this);
  if (!items.length) layout.addGap(Size.ITEM);
  layout
    .modify(this.addPlayerItemColLabel_.bind(this, type));
};

PrebattleScene.prototype.createPlayerItemBtn_ = function(item) {
  var btn = this.createItemBtn_(item);
  if (!item) return btn;

  this.playerBtns_.push(btn.modify(this.addPlayerItemInputHandler_, this));
  return btn;
};

PrebattleScene.prototype.addPlayerItemInputHandler_ = function(btn) {
  btn.onClick(function() {
    if (this.selectedPlayerBtn_ == btn) {
      this.unselectPlayerBtn_();
      this.maybeUnequipPlayerBtnItem_(btn);
    } else {
      this.selectPlayerBtn_(btn);
      this.equipPlayerBtnItem_(btn);
    }
    this.updatePlayerBtnStyles_();
    this.playerItemDesc_.setItem(
        this.selectedPlayerBtn_ && btn.getProp('item'));
  }, this);
};

PrebattleScene.prototype.selectPlayerBtn_ = function(btn) {
  if (this.selectedPlayerBtn_) this.unselectPlayerBtn_();
  this.selectedPlayerBtn_ = btn;
  btn.setProp('selected', true);
};

PrebattleScene.prototype.unselectPlayerBtn_ = function() {
  this.selectedPlayerBtn_.setProp('selected', false);
  this.selectedPlayerBtn_ = undefined;
};

PrebattleScene.prototype.equipPlayerBtnItem_ = function(btn) {
  var type = btn.getProp('item').category;
  var equipped = this.inventory_.getEquipped(type);
  if (equipped) this.inventory_.unequip(equipped);
  this.inventory_.equip(btn.getProp('item'));
};

PrebattleScene.prototype.maybeUnequipPlayerBtnItem_ = function(btn) {
  if (btn.getProp('item') == this.inventory_.getEquipped('primary')) {
    // Can't unequip primary weapon.
    return;
  }
  this.inventory_.unequip(btn.getProp('item'));
};

PrebattleScene.prototype.addPlayerItemColLabel_ = function(type, layout) {
  layout.add(this.LayoutElement_.new('horizontal')
    .setStyle('muted')
    .setLayoutFill(true)
    .add(this.LabelElement_.new()
      .setLayoutAlign('center')
      .setText(Strings.ItemType[type], Size.DESC)
      .setBg('', Padding.DESC_SM_BG)));
};

PrebattleScene.prototype.updatePlayerBtnStyles_ = function() {
  _.each(this.playerBtns_, function(btn) {
    var item = btn.getProp('item');
    btn.setStyle(this.inventory_.isEquipped(item) ? 'equipped' : 'unequipped');
  }, this);
};

PrebattleScene.prototype.createItemBtn_ = function(item) {
  if (!item) {
    return this.UiElement_.new().setPadding(Size.ITEM, Size.ITEM, 0, 0);
  }
  return this.EntityElement_.new('item')
    .setSize(Size.ITEM)
    .setProp('item', item);
};

PrebattleScene.prototype.fight_ = function(dt) {
  if (this.timeToTransition_ <= 0) {
    this.transition_('battle', {time: 0});
  } else {
    this.layout_.animate('alpha', 0, {duration: .5});
    this.startBattle_ = true;
  }
};

PrebattleScene.prototype.back_ = function(dt) {
  this.goBackTo_('stageSelect');
  this.fadeToBlack_();
};

PrebattleScene.prototype.toggleEquip_ = function() {
  this.showingPlayerInventory_ = !this.showingPlayerInventory_;
  var alpha = this.showingPlayerInventory_ ? 1 : 0;
  this.playerInventory_.animate(
      'alpha', alpha, {duration: Time.TRANSITION_SNAP});
  this.playerItemDesc_.setItem(null);
  this.playerInventory_.setPauseInput(!this.showingPlayerInventory_);
  this.equipBtn_.setBgStyle(this.showingPlayerInventory_ ? 'pressed' : 'primary');
  this.equipBtn_.setStyle(this.showingPlayerInventory_ ? 'muted' : 'primary');
};

PrebattleScene.prototype.update_ = function(dt) {
  this.Scene_.update_.call(this, dt);
  this.shipLayout_.update(dt);
  if ((this.timeToTransition_ -= dt) <= 0 && this.startBattle_) {
    this.transition_('battle', {time: 0});
  }
};
