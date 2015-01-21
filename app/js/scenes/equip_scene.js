var EquipScene = di.service('EquipScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement',
  'UiElement', 'Inventory']);

EquipScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('equip'));
};

EquipScene.prototype.addEntities_ = function() {
  this.entityElement_.create('equipSplash');

  var itemBtns = [];
  this.equippedBtn_ = null;
  _.each(this.inventory_.get(this.gm_.equipping), function(item) {
    var btn = this.createItemBtn_(item);
    itemBtns.push(btn);
  }, this);

  var continueBtn = this.btnElement_.create();
  continueBtn.setText('done', {size: 'btn'});
  continueBtn.onClick(function() {
    this.transitionFast_('equipOptions');
  }.bind(this));

  this.layout_ = this.layoutElement_.create({
    direction: 'vertical', align: 'top'});
  this.layout_.padding.left = 'btn-lg';
  this.layout_.padding.top = 'btn-lg';
  this.layout_.padding.bottom = 'btn';
  _.each(itemBtns, function(btn) {
    this.layout_.add(btn);
    btn.padding.bottom = 'btn-lg';
  }, this);
  this.layout_.add(this.uiElement_.create(), {flex: 1});
  this.layout_.add(continueBtn);
  continueBtn.padding.left = 'btn-mix';
};

EquipScene.prototype.createItemBtn_ = function(item) {
  var btn = this.btnElement_.create();
  btn.item = item;
  btn.setText(item.name, {size: 'btn-lg'});
  if (this.inventory_.isEquipped(item)) {
    btn.setStyle('equipped');
    this.equippedBtn_ = btn;
  }
  btn.onClick(this.onItemBtnClick_.bind(this));
  return btn;
};

EquipScene.prototype.onItemBtnClick_ = function(btn) {
  if (this.equippedBtn_) {
    this.inventory_.unequip(this.equippedBtn_.item);
    this.equippedBtn_.setStyle('unequipped');
  }
  this.inventory_.equip(btn.item);
  btn.setStyle('equipped');
  this.equippedBtn_ = btn;
};

EquipScene.prototype.update_ = function(dt) {
  this.layout_.update();
};
