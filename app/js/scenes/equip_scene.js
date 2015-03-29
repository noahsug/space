var EquipScene = di.service('EquipScene', [
  'GameModel as gm', 'Scene', 'LayoutElement', 'BtnElement', 'EntityElement',
  'UiElement', 'Inventory', 'RoundBtnElement']);

EquipScene.prototype.init = function() {
  _.class.extend(this, this.scene_.create('equip'));
};

EquipScene.prototype.addEntities_ = function() {
  this.entityElement_.create('equipSplash');

  var itemDesc = this.entityElement_.create('itemDesc');
  itemDesc.childHeight = 32;
  itemDesc.getEntity().update(function() {
    if (this.equippedBtn_) {
      itemDesc.setProp('item', this.equippedBtn_.getProp('item'));
    }
  }.bind(this));

  var itemBtns = [];
  this.equippedBtn_ = null;
  _.each(this.inventory_.get(this.gm_.equipping), function(item, i) {
    var btn = this.createItemBtn_(item);
    itemBtns[i] = btn;
  }, this);

  var continueBtn = this.btnElement_.create();
  continueBtn.setText('back', {size: 'btn-sm'});
  continueBtn.onClick(function() {
    this.transitionFast_(this.gm_.transition.prev);
  }.bind(this));

  this.layout_ = this.layoutElement_.create({
    direction: 'vertical', align: 'top'});
  this.layout_.padding.top = 50;
  this.layout_.padding.bottom = 30;

  for (var i = 0; i < itemBtns.length; i+= 2) {
    var btn1 = itemBtns[i];
    var btn2 = itemBtns[i + 1] || this.createItemBtn_({name: ''});
    var itemRow = this.layoutElement_.create();
    itemRow.childHeight = btn1.getEntity().radius * 2;
    itemRow.padding.bottom = 20;
    itemRow.add(btn1);
    itemRow.add(btn2);
    btn1.padding.right = btn2.padding.right = 20;
    this.layout_.add(itemRow);
  }

  this.layout_.addFlex();

  this.layout_.add(itemDesc);

  this.layout_.add(continueBtn);
  continueBtn.layout.align = 'top';
  continueBtn.padding.top = 25;
  continueBtn.padding.left = 'btn-sm';
};

EquipScene.prototype.createItemBtn_ = function(item) {
  var btn = this.roundBtnElement_.create();
  btn.setSize('item');
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
