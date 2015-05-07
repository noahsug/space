var EquipScene = di.service('EquipScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement',
  'LabelElement', 'Inventory', 'RoundBtnElement']);

EquipScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('equip'));
};

EquipScene.prototype.addEntities_ = function() {
  var COLS = 4;  // Number of columns in the item grid.

  this.equippedBtn_ = undefined;
  this.layout_ = this.layoutElement_.create({direction: 'vertical'});
  this.layout_.padding.top = Padding.MD;

  // Player items.
  _.each(Game.ITEM_TYPES, function(type, i) {
    var pos = i % COLS;
    // Gap between rows.
    if (pos == 0 && i) this.layout_.addGap(Padding.ITEM);
    // New row.
    if (pos == 0) {
      row = this.layout_.addNew(this.layoutElement_);
      row.childHeight = Size.ITEM * 1.3;
    }
    // Gap between btns.
    if (pos) row.addGap(Padding.ITEM);
    // The btn.
    row.add(this.createPlayerTypeButton_(type));
  }, this);

  this.layout_.addGap(Padding.MD);

  // Label.
  this.layout_.addNew(this.entityElement_, 'break');
  //var labelRow = this.layout_.addNew(this.layoutElement_);
  //labelRow.layout.align = 'top';
  //labelRow.childHeight = Size.TEXT + Padding.ITEM;
  //var label = labelRow.addNew(this.labelElement_);
  //label.setText('equip ' + Strings.ItemType[this.gm_.equipping] + ':',
  //              {size: Size.TEXT, align: 'left', baseline: 'top'});
  //labelRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);

  this.layout_.addGap(Padding.MD);

  // Stages.
  var row;
  var items = this.inventory_.get(this.gm_.equipping);
  for (var i = 0; i < items.length || i % COLS; i++) {
    var item = items[i];
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
    // The btn or gap where the btn would be.
    if (item) row.add(this.createItemBtn_(item));
    else row.addGap(Size.ITEM);
  }

  this.layout_.addGap(Padding.MD);

  // Item Description.
  var itemDescRow = this.layout_.addNew(this.layoutElement_);
  var itemDesc = itemDescRow.addNew(this.entityElement_, 'itemDesc');
  itemDesc.childHeight = Size.ITEM_DESC;
  itemDesc.getEntity().update(function() {
    if (this.equippedBtn_) {
      itemDesc.setProp('item', this.equippedBtn_.getProp('item'));
    }
  }.bind(this));
  itemDescRow.addGap(Padding.ITEM * (COLS - 1) + Size.ITEM * COLS);
  itemDescRow.childHeight = itemDesc.childHeight;

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
    this.transitionFast_(this.gm_.transition.prev);
  }.bind(this));
};

EquipScene.prototype.createPlayerTypeButton_ = function(type) {
  var btn = this.roundBtnElement_.create();
  if (this.gm_.equipping == type) {
    btn.setStyle('selected');
    btn.setSize(Size.ITEM * 1.3);
  } else {
    btn.setSize(Size.ITEM * .9);
  }
  btn.setProp('category', type);
  if (this.inventory_.has(type)) {
    btn.onClick(function() {
      this.gm_.equipping = type;
      this.updateItems_();
    }.bind(this));
  }
  return btn;
};

EquipScene.prototype.updateItems_ = function() {
  this.removeEntities_();
  this.addEntities_();
  this.update_();
};

EquipScene.prototype.createItemBtn_ = function(item) {
  var btn = this.roundBtnElement_.create();
  btn.setSize(Size.ITEM);
  btn.setProp('item', item);
  if (this.inventory_.isEquipped(item)) {
    btn.setStyle('equipped');
    this.equippedBtn_ = btn;
  }
  if (item.name) {
    btn.onClick(this.onItemBtnClick_.bind(this));
  } else {
    btn.setStyle('hidden');
  }
  return btn;
};

EquipScene.prototype.onItemBtnClick_ = function(btn) {
  if (this.equippedBtn_) {
    this.inventory_.unequip(this.equippedBtn_.getProp('item'));
    this.equippedBtn_.setStyle('unequipped');
    if (this.equippedBtn_.getProp('item').name == btn.getProp('item').name &&
        btn.getProp('item').category != 'primary') {
      this.equippedBtn_ = null;
      return;
    }
  }
  this.inventory_.equip(btn.getProp('item'));
  btn.setStyle('equipped');
  this.equippedBtn_ = btn;
};

EquipScene.prototype.update_ = function(dt) {
  this.layout_.update();
};
