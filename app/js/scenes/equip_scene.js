var EquipScene = di.service('EquipScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BackdropElement',
  'LabelElement', 'ItemElement', 'Inventory', 'ItemService']);

EquipScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'equip');
};

EquipScene.prototype.onStart_ = function() {
  this.btns_ = [];
  this.selectedBtn_ = null;
};

EquipScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .consumeClicks()
    .setChildrenBaselineAlign('bottom', 'right')
    .setPadding('bottom', Padding.MARGIN + Size.BUTTON +
                          Padding.BUTTON_BG * 2 + Padding.MARGIN_SM)
    .setPadding('right', Padding.MARGIN)
    .add(this.LayoutElement_.new('vertical')
       .modify(this.addItemDescContainer_, this)

      .addGap(Padding.MARGIN_SM)

      .add(this.LayoutElement_.new('vertical')
        .onNotClick(this.closeAsModal_, this)
        .setBgFill(true)
        .setPadding(Padding.MODAL_MARGIN_SM)
        .setPadding('bottom', Padding.MODAL_MARGIN_SM)
        .setBgStyle('muted_dark')
        .setBorderStyle('primary')

        // Item cols.
        .add(this.LayoutElement_.new('horizontal')
          .modify(this.addItemCols_, this))));

  this.updateItemDesc_();
  this.updateBtnStyles_();
};

EquipScene.prototype.addItemDescContainer_ = function(layout) {
  this.itemDescContainer_ = this.LayoutElement_.new('vertical')
    .setPadding(Padding.MODAL_MARGIN_SM)
    .setBgFill(true)
    .setBgStyle('muted_dark')
    .setBorderStyle('primary')
    .modify(this.addItemDesc_, this);
  layout.add(this.itemDescContainer_);
};

EquipScene.prototype.addItemDesc_ = function(layout) {
  this.itemDescTitle_ = this.LabelElement_.new()
    .setBg('primary', Padding.DESC_SM_BG)
    .setText('', Size.DESC_SM);
  this.itemDescBody_ = this.LabelElement_.new()
    .setLayoutFill(true)
    .setNumLines(2)
    .setLineWrap(true)
    .setBg('none', Padding.DESC_SM_BG)
    .setText('', Size.DESC_SM);

  layout
    .add(this.itemDescTitle_)
    .add(this.itemDescBody_);
};

EquipScene.prototype.addItemCols_ = function(layout) {
  _.each(Game.ITEM_TYPES, function(type, i) {
    if (i) layout.addGap(Padding.ITEM);
    layout.add(this.LayoutElement_.new('vertical')
      .setChildrenBaseline('bottom')
      .modify(this.addItemCol_.bind(this, type)));
  }, this);
};

EquipScene.prototype.addItemCol_ = function(type, layout) {
  var items = this.inventory_.get(type);
  _.each(items, function(item, i) {
    layout.add(this.createItemBtn_(item));
  }, this);
  if (!items.length) layout.addGap(Size.ITEM);
  layout.modify(this.addItemColLabel_.bind(this, type));
};

EquipScene.prototype.createItemBtn_ = function(item) {
  this.btns_.push(this.ItemElement_.new()
    .setSize(Size.ITEM)
    .setProp('item', item)
    .modify(this.addInputHandler_, this));
  return _.last(this.btns_);
};

EquipScene.prototype.addInputHandler_ = function(btn) {
  btn.onClick(function() {
    if (this.selectedBtn_ == btn) {
      this.unselectBtn_();
      this.maybeUnequipBtnItem_(btn);
    } else {
      this.selectBtn_(btn);
      this.equipBtnItem_(btn);
    }
    this.updateBtnStyles_();
    this.updateItemDesc_();
  }, this);
};

EquipScene.prototype.selectBtn_ = function(btn) {
  if (this.selectedBtn_) this.unselectBtn_();
  this.selectedBtn_ = btn;
  btn.setProp('selected', true);
};

EquipScene.prototype.unselectBtn_ = function() {
  this.selectedBtn_.setProp('selected', false);
  this.selectedBtn_ = null;
};

EquipScene.prototype.equipBtnItem_ = function(btn) {
  var type = btn.getProp('item').category;
  var equipped = this.inventory_.getEquipped(type);
  if (equipped) this.inventory_.unequip(equipped);
  this.inventory_.equip(btn.getProp('item'));
};

EquipScene.prototype.maybeUnequipBtnItem_ = function(btn) {
  if (btn.getProp('item') == this.inventory_.getEquipped('primary')) {
    // Can't unequip primary weapon.
    return;
  }
  this.inventory_.unequip(btn.getProp('item'));
};

EquipScene.prototype.addItemColLabel_ = function(type, layout) {
  layout.add(this.LayoutElement_.new('horizontal')
    .setStyle('muted')
    .setBgStyle('primary')
    .setBgFill(true)
    .setLayoutFill(true)
    .add(this.LabelElement_.new()
      .setLayoutAlign('center')
      .setText(Strings.ItemType[type], Size.DESC_SM)
      .setBg('', Padding.DESC_SM_BG)));
};

EquipScene.prototype.updateItemDesc_ = function() {
  var item = this.selectedBtn_ && this.selectedBtn_.getProp('item');
  if (item) {
    this.itemDescTitle_.setText(item.displayName, Size.DESC_SM);
    this.itemDescTitle_.setStyle('muted');
    this.itemDescBody_.setText(
        this.itemService_.getDesc(item), Size.DESC_SM);
    this.itemDescBody_.setStyle('muted');
    this.itemDescContainer_.setStyle('');
  } else {
    this.itemDescTitle_.setStyle('hidden');
    this.itemDescBody_.setStyle('hidden');
    this.itemDescContainer_.setStyle('hidden');
  }
};

EquipScene.prototype.updateBtnStyles_ = function() {
  _.each(this.btns_, function(btn) {
    var item = btn.getProp('item');
    btn.setStyle(this.inventory_.isEquipped(item) ? 'equipped' : 'unequipped');
  }, this);
};
