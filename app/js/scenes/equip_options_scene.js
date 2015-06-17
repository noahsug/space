var EquipOptionsScene = di.service('EquipOptionsScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'EntityElement',
  'LabelElement', 'RoundBtnElement', 'Inventory', 'ItemService']);

EquipOptionsScene.prototype.init = function() {
  _.class.extend(this, this.Scene_.new('equipOptions'));
};

EquipOptionsScene.prototype.addEntities_ = function() {
  var COLS = 4;  // Number of columns in the item grid.

  this.layout_ = this.LayoutElement_.new({direction: 'vertical'});

  this.layout_.addFlex();

  // Enemy item label.
  var enemyLabelRow = this.layout_.addNew(this.LayoutElement_);
  enemyLabelRow.layout.align = 'top';
  enemyLabelRow.innerHeight = Size.TEXT_LG;
  var enemyLabel = enemyLabelRow.addNew(this.LabelElement_);
  enemyLabel.setText(this.gm_.stage.desc, Size.TEXT_LG,
                     {align: 'left', baseline: 'top'});
  enemyLabelRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);

  this.layout_.addGap(Padding.MD);

  // Item Description.
  var itemDescRow = this.layout_.addNew(this.LayoutElement_);
  var itemDesc = itemDescRow.addNew(this.EntityElement_, 'itemDesc');
  itemDesc.innerHeight = Size.ITEM_DESC;
  itemDesc.getEntity().update(function() {
    var item = this.selectedBtn_ && this.selectedBtn_.getProp('item');
    itemDesc.setProp('item', item);
  }.bind(this));
  itemDescRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);
  itemDescRow.innerHeight = itemDesc.innerHeight;

  this.layout_.addGap(Padding.ITEM);

  // Enemy items.
  this.selectedBtn_ = null;
  var row;
  _.each(Game.ITEM_TYPES, function(type, i) {
    var pos = i % COLS;
    // Gap between rows.
    if (pos == 0 && i) this.layout_.addGap(Padding.ITEM);
    // New row.
    if (pos == 0) {
      row = this.layout_.addNew(this.LayoutElement_);
      row.innerHeight = Size.ITEM;
    }
    // Gap between btns.
    if (pos) row.addGap(Padding.ITEM);
    // The btn.
    row.add(this.createEnemyItemButton_(type));
  }, this);

  // Enemy splash.
  var enemySplash = this.layout_.addNew(this.EntityElement_, 'enemySplash');
  enemySplash.innerHeight = Size.SHIP;

  this.layout_.addGap(Padding.MD);

  // Player splash.
  var playerSplash = this.layout_.addNew(this.EntityElement_, 'playerSplash');
  playerSplash.innerHeight = Size.SHIP;

  // Player items.
  _.each(Game.ITEM_TYPES, function(type, i) {
    var pos = i % COLS;
    // Gap between rows.
    if (pos == 0 && i) this.layout_.addGap(Padding.ITEM);
    // New row.
    if (pos == 0) {
      row = this.layout_.addNew(this.LayoutElement_);
      row.innerHeight = Size.ITEM;
    }
    // Gap between btns.
    if (pos) row.addGap(Padding.ITEM);
    // The btn.
    row.add(this.createPlayerItemButton_(type));
  }, this);

  this.layout_.addFlex();

  // Back button.
  var btnRow = this.layout_.addNew(this.LayoutElement_);
  btnRow.setAlign('left');
  btnRow.layout.align = 'top';
  btnRow.innerHeight = Size.TEXT + Padding.BOT;
  var backBtn = btnRow.addNew(this.LabelElement_);
  backBtn.layout.align = 'left';
  backBtn.padding.left = Padding.MD;
  backBtn.setText('back', Size.TEXT);
  backBtn.onClick(function() {
    this.transitionFast_(stageSelect);
  }.bind(this));

  btnRow.addFlex();

  // Fight button.
  var fightBtn = btnRow.addNew(this.LabelElement_);
  fightBtn.layout.align = 'left';
  fightBtn.padding.right = Padding.MD;
  fightBtn.setText('fight', Size.TEXT);
  fightBtn.onClick(function() {
    this.transition_('battle');
  }.bind(this));
};

EquipOptionsScene.prototype.createPlayerItemButton_ = function(type) {
  var btn = this.RoundBtnElement_.new();
  btn.setSize(Size.ITEM);
  btn.setProp('item', this.inventory_.getEquipped(type) || {category: type});
  if (this.inventory_.has(type)) {
    btn.onClick(function() {
      this.gm_.equipping = type;
      this.transitionFast_('equip');
    }.bind(this));
  }
  return btn;
};

EquipOptionsScene.prototype.createEnemyItemButton_ = function(type) {
  var btn = this.RoundBtnElement_.new();
  btn.setSize(Size.ITEM);
  btn.setProp('enemy', true);
  var item = this.itemService_.getEnemyEquipped(type) || {category: type};
  btn.setProp('item', item);
  btn.onClick(function() {
    if (this.selectedBtn_) this.selectedBtn_.setStyle('');
    if (item.name) {
      this.selectedBtn_ = btn;
      this.selectedBtn_.setStyle('active');
    } else {
      this.selectedBtn_ = null;
    }
  }.bind(this));
  return btn;
};

EquipOptionsScene.prototype.update_ = function(dt) {
  this.layout_.update();
};
