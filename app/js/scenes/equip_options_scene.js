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

  // Aug item label.
  var enemyLabelRow = this.layout_.addNew(this.layoutElement_);
  enemyLabelRow.layout.align = 'top';
  enemyLabelRow.childHeight = Size.TEXT_LG;
  var enemyLabel = enemyLabelRow.addNew(this.labelElement_);
  enemyLabel.setText(this.gm_.stage.desc,
                     {size: Size.TEXT_LG, align: 'left', baseline: 'top'});
  enemyLabelRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);

  this.layout_.addGap(Padding.MD);

  // Item Description.
  var itemDescRow = this.layout_.addNew(this.layoutElement_);
  var itemDesc = itemDescRow.addNew(this.entityElement_, 'itemDesc');
  itemDesc.childHeight = Size.ITEM_DESC;
  itemDesc.getEntity().update(function() {
    var item = this.selectedBtn_ && this.selectedBtn_.getProp('item');
    itemDesc.setProp('item', item);
  }.bind(this));
  itemDescRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);
  itemDescRow.childHeight = itemDesc.childHeight;

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
      row = this.layout_.addNew(this.layoutElement_);
      row.childHeight = Size.ITEM;
    }
    // Gap between btns.
    if (pos) row.addGap(Padding.ITEM);
    // The btn.
    row.add(this.createEnemyItemButton_(type));
  }, this);

  // Enemy splash.
  var enemySplash = this.layout_.addNew(this.entityElement_, 'enemySplash');
  enemySplash.childHeight = Size.SHIP;

  this.layout_.addGap(Padding.MD);

  // Player splash.
  var playerSplash = this.layout_.addNew(this.entityElement_, 'playerSplash');
  playerSplash.childHeight = Size.SHIP;

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

  if (this.inventory_.getEquipped('augment').length > 0) {
    this.layout_.addGap(Padding.MD);

    // Aug item label.
    var augLabelRow = this.layout_.addNew(this.layoutElement_);
    augLabelRow.layout.align = 'top';
    augLabelRow.childHeight = Size.TEXT;
    var augLabel = augLabelRow.addNew(this.labelElement_);
    augLabel.setText(Strings.ItemType['augment'] + 's:',
                     {size: Size.TEXT, align: 'left', baseline: 'top'});
    augLabelRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);

    this.layout_.addGap(Padding.ITEM);

    // Augmentations.
    _.each(this.inventory_.getEquipped('augment'), function(item, i) {
      if (i) this.layout_.addGap(Padding.ITEM);
      var augRow = this.layout_.addNew(this.layoutElement_);
      augRow.layout.align = 'top';
      augRow.childHeight = Size.TEXT;
      var aug = augRow.addNew(this.labelElement_);
      aug.setText('-  ' + item.desc,
                       {size: Size.TEXT, align: 'left', baseline: 'top'});
      aug.padding.left = Padding.ITEM;
      augRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);
    }, this);
  } else {
    this.layout_.addGap(Size.ITEM_DESC);
  }

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
