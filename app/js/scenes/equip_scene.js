var EquipScene = di.service('EquipScene', [
  'GameModel as gm', 'Screen', 'Entity', 'EntityDecorator', 'gameplay']);

EquipScene.MAX_INVENTORY_SIZE = 8;

EquipScene.prototype.init = function() {
  this.gm_.scenes['equip'] = 'inactive';
};

EquipScene.prototype.start = function() {
  this.gm_.scenes['equip'] = 'active';
  this.addEntities_();
};

EquipScene.prototype.addEntities_ = function() {
  this.createInventory_();
  this.positionInventory_();
  _.each(this.inventory_, function(slot) {
    this.gm_.entities.add(slot);
  }, this);

  var d = this.entityDecorator_.getDecorators();
  var exitBtn = this.entity_.create('btn');
  _.decorate(exitBtn, d.shape.text, {text: 'x', size: 40});
  _.decorate(exitBtn, d.clickable);
  this.gm_.entities.add(exitBtn, 'exitBtn');
};

EquipScene.prototype.createInventory_ = function() {
  var d = this.entityDecorator_.getDecorators();

  this.inventory_ = [];
  for (var i = 0; i < EquipScene.MAX_INVENTORY_SIZE; i++) {
    var slot = this.entity_.create('inventorySlot');
    _.decorate(slot, d.shape.circle, {radius: 35});
    _.decorate(slot, d.clickable);
    slot.equipped = false;
    this.inventory_.push(slot);
  }

  _.each(this.gm_.player.inventory, function(item, i) {
    var slot = this.inventory_[i];
    slot.item = item;
    slot.equipped = this.isEquipped_(item);
  }, this);
};

EquipScene.prototype.getEquippedItemIndex_ = function(item) {
  return _.findIndexWhere(this.gm_.player.spec, {name: item.name});
};

EquipScene.prototype.isEquipped_ = function(item) {
  return this.getEquippedItemIndex_(item) != -1;
};

EquipScene.prototype.positionInventory_ = function() {
  var GAP = 35;
  var COLS = EquipScene.MAX_INVENTORY_SIZE / 2;
  var WIDTH = this.inventory_[0].radius * 2;
  var x = -((COLS - 1) * (WIDTH + GAP)) / 2;
  for (var i = 0; i < this.inventory_.length / 2; i ++) {
    var dy = (WIDTH + GAP) / 2;

    var topSlot = this.inventory_[i];
    topSlot.x = this.screen_.x + x;
    topSlot.y = this.screen_.y - dy;

    var bottomSlot = this.inventory_[i + this.inventory_.length / 2];
    bottomSlot.x = topSlot.x;
    bottomSlot.y = this.screen_.y + dy;

    x += WIDTH + GAP;

    if (!this.screen_.portrait) {
      _.swap(bottomSlot, 'x', 'y');
      _.swap(topSlot, 'x', 'y');
    }
  }
};

EquipScene.prototype.removeEntities_ = function() {
  this.gm_.entities.clear();
};

EquipScene.prototype.update = function() {
  if (this.gm_.scenes['equip'] != 'active') return;
  _.each(this.inventory_, function(slot, i) {
    if (slot.item && slot.clicked) {
      slot.equipped = !slot.equipped;
      if (slot.equipped) {
        this.gm_.player.spec.push(slot.item);
      } else {
        var equipIndex = this.getEquippedItemIndex_(slot.item);
        this.gm_.player.spec.splice(equipIndex, 1);
      }
    }
  }, this);

  var exitBtn = this.gm_.entities.obj['exitBtn'];
  exitBtn.x = this.screen_.x + this.screen_.width / 2 - 30;
  exitBtn.y = this.screen_.y + -this.screen_.height / 2 + 30;

  if (exitBtn.clicked) {
    this.gm_.scenes['equip'] = 'inactive';
    this.removeEntities_();
    this.gm_.scenes['battle'] = 'start';
  }
};

EquipScene.prototype.resolve = function(dt) {
  if (this.gm_.scenes['equip'] == 'start') {
    this.start();
    this.update(dt);
  }
};
