var ShipDetailsScene = di.service('ShipDetailsScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BackdropElement',
  'LabelElement', 'ItemElement', 'UiElement', 'ItemService']);

ShipDetailsScene.prototype.init = function() {
  di.extend(this, this.Scene_, 'shipDetails');
};

ShipDetailsScene.prototype.onStart_ = function() {
  this.addEntities_();
};

ShipDetailsScene.prototype.addEntities_ = function() {
  this.layout_ = this.LayoutElement_.new('vertical')
    .consumeOnClick()
    .setChildrenBaselineAlign('middle', 'center')
    .add(this.LayoutElement_.new('vertical')
      .onNotClick(this.closeAsModal_, this)
      .setBgFill(true)
      .setPadding(Padding.MODAL_MARGIN_SM)
      .setBgStyle('muted_dark')
      .setBorderStyle('primary')

      .add(this.LabelElement_.new()
           .setText(this.gm_.stage.desc, Size.DESC_LG)
           .setStyle('muted'))

      .addGap(Padding.MODAL_MARGIN_SM)

      // Items.
      .add(this.LayoutElement_.new('horizontal')
        .modify(this.addItems_, this))

      .addGap(Padding.MODAL_MARGIN_SM)

      .modify(this.addItemDesc_, this)

      .addGap(Padding.MODAL_MARGIN_SM)

      .add(this.LabelElement_.new()
        .setLayoutAlign('center')
        .setText('fight', Size.BUTTON)
        .setStyle('active')
        .setBg('primary', Padding.BUTTON_BG)
        .onClick(this.goToBattle_, this)));

  this.updateItemDesc_();
};

ShipDetailsScene.prototype.addItems_ = function(layout) {
  _.each(Game.ITEM_TYPES, function(type, i) {
    var item = this.itemService_.getEnemyEquipped(type);
    if (i) layout.addGap(Padding.ITEM);
    layout.add(this.createItemBtn_(item));
  }, this);
};

ShipDetailsScene.prototype.createItemBtn_ = function(item) {
  if (!item) {
    return this.UiElement_.new().setPadding(Size.ITEM, Size.ITEM, 0, 0);
  }
  var btn = this.ItemElement_.new()
    .setSize(Size.ITEM)
    .setProp('item', item)
    .onClick(this.selectBtn_, this);
  // Select the first item.
  if (!this.selectedBtn_) this.selectedBtn_ = btn;
  return btn;
};

ShipDetailsScene.prototype.selectBtn_ = function(btn) {
  if (this.selectedBtn_) this.selectedBtn_.setProp('selected', false);
  this.selectedBtn_ = btn;
  btn.setProp('selected', true);
  this.updateItemDesc_();
};

ShipDetailsScene.prototype.updateItemDesc_ = function() {
  var item = this.selectedBtn_.getProp('item');
  this.itemDescTitle_.setText(item.displayName, Size.DESC_SM);
  this.itemDescBody_.setText(this.itemService_.getDesc(item), Size.DESC_SM);
};

ShipDetailsScene.prototype.goToBattle_ = function() {
  this.transition_('battle');
};

ShipDetailsScene.prototype.addItemDesc_ = function(layout) {
  this.itemDescTitle_ = this.LabelElement_.new()
    .setBg('primary', Padding.DESC_SM_BG)
    .setStyle('muted')
    .setText('', Size.DESC_SM);
  this.itemDescBody_ = this.LabelElement_.new()
    .setLayoutFill(true)
    .setNumLines(2)
    .setLineWrap(true)
    .setStyle('muted')
    .setBg('none', Padding.DESC_SM_BG)
    .setPadding('bottom', 0)
    .setText('', Size.DESC_SM);

  layout
    .add(this.itemDescTitle_)
    .add(this.itemDescBody_);
};
