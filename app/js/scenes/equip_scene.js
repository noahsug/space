var EquipScene = di.service('EquipScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement',
  'LabelElement', 'Inventory', 'RoundBtnElement']);

EquipScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('equip'));
};

var COLS = 3;  // Number of columns in the item grid.
EquipScene.prototype.addEntities_ = function() {
  this.layout_ = this.layoutElement_.create({direction: 'vertical'});
  this.layout_.padding.top = -Padding.SM + Padding.BOT;

  this.layout_.addFlex();

  // Label.
  var labelRow = this.layout_.addNew(this.layoutElement_);
  labelRow.layout.align = 'top';
  labelRow.childHeight = Size.TEXT + Padding.SM;
  var label = labelRow.addNew(this.labelElement_);
  label.setText('equip ' + Strings.ItemType[this.gm_.equipping] + ':',
                     {size: Size.TEXT, align: 'left'});
  labelRow.addGap(Padding.SM * 2 + Size.LEVEL * 3);

  // Levels.
  var row;
  var items = this.inventory_.get(this.gm_.equipping);
  for (var i = 0; i < items.length || i % COLS; i++) {
    var item = items[i];
    var pos = i % COLS;
    // Gap between rows.
    if (pos == 0 && i) this.layout_.addGap(Padding.SM);
    // New row.
    if (pos == 0) {
      row = this.layout_.addNew(this.layoutElement_);
      row.childHeight = Size.LEVEL;
    }
    // Gap between btns.
    if (pos) row.addGap(Padding.SM);
    // The btn or gap where the btn would be.
    if (item) row.add(this.createItemBtn_(item));
    else row.addGap(Size.LEVEL);
  }

  this.layout_.addGap(Padding.MD);

  // Item Description.
  var itemDesc = this.layout_.addNew(this.entityElement_, 'itemDesc');
  itemDesc.childHeight = 32;
  itemDesc.getEntity().update(function() {
    if (this.equippedBtn_) {
      itemDesc.setProp('item', this.equippedBtn_.getProp('item'));
    }
  }.bind(this));

  this.layout_.addFlex();

  // Back button.
  var btnRow = this.layout_.addNew(this.layoutElement_);
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
  btnRow.addFlex(1);
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
