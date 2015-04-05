var EquipOptionsScene = di.service('EquipOptionsScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement',
  'LabelElement', 'RoundBtnElement', 'Inventory', 'ItemService']);

EquipOptionsScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('equipOptions'));
};

var ITEM_PADDING = 20;
EquipOptionsScene.prototype.addEntities_ = function() {
  var COLS = 4;  // Number of columns in the item grid.

  this.layout_ = this.layoutElement_.create({direction: 'vertical'});

  this.layout_.addFlex();

  // Enemy label.
  var enemyLabelRow = this.layout_.addNew(this.layoutElement_);
  enemyLabelRow.layout.align = 'top';
  enemyLabelRow.childHeight = Size.TEXT + Padding.ITEM;
  var enemyLabel = enemyLabelRow.addNew(this.labelElement_);
  enemyLabel.setText('rank ' + Strings.rank(this.gm_.level.type) + ' enemy:',
                     {size: Size.TEXT, align: 'left', baseline: 'top'});
  enemyLabelRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);

  // Enemy items.
  this.selectedBtn_ = null;
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
    row.add(this.createEnemyItemButton_(type));
  }, this);

  this.layout_.addGap(Padding.ITEM);

  // Item Description.
  var itemDescRow = this.layout_.addNew(this.layoutElement_);
  var itemDesc = itemDescRow.addNew(this.entityElement_, 'itemDesc');
  itemDesc.childHeight = Size.TEXT * 2 + 4;
  itemDesc.getEntity().update(function() {
    var item = this.selectedBtn_ && this.selectedBtn_.getProp('item');
    itemDesc.setProp('item', item);
  }.bind(this));
  itemDescRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);
  itemDescRow.childHeight = itemDesc.childHeight;

  this.layout_.addGap(Padding.MD);

  // Player item label.
  var playerLabelRow = this.layout_.addNew(this.layoutElement_);
  playerLabelRow.layout.align = 'top';
  playerLabelRow.childHeight = Size.TEXT + Padding.ITEM;
  var playerLabel = playerLabelRow.addNew(this.labelElement_);
  playerLabel.setText('equipment:',
                     {size: Size.TEXT, align: 'left', baseline: 'top'});
  playerLabelRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);

  // Player items.
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
    row.add(this.createPlayerItemButton_(type));
  }, this);

  this.layout_.addFlex();

  // Back button.
  var btnRow = this.layout_.addNew(this.layoutElement_);
  btnRow.setAlign('left');
  btnRow.layout.align = 'top';
  btnRow.childHeight = Size.TEXT + Padding.BOT;
  var backBtn = btnRow.addNew(this.btnElement_);
  backBtn.layout.align = 'left';
  backBtn.padding.left = Padding.MD;
  backBtn.setText('back', {size: Size.TEXT});
  backBtn.setLineDirection('left');
  backBtn.onClick(function() {
    this.transitionFast_('main');
  }.bind(this));

  btnRow.addFlex();

  // Fight button.
  var fightBtn = btnRow.addNew(this.btnElement_);
  fightBtn.layout.align = 'left';
  fightBtn.padding.right = Padding.MD;
  fightBtn.setText('fight', {size: Size.TEXT});
  fightBtn.onClick(function() {
    this.transition_('battle');
  }.bind(this));
};

EquipOptionsScene.prototype.createPlayerItemButton_ = function(type) {
  var btn = this.roundBtnElement_.create();
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
  var btn = this.roundBtnElement_.create();
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
