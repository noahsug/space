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
  _.each(this.inventory_, function(slot) {
    this.gm_.entities.add(slot);
  }, this);

  var d = this.entityDecorator_.getDecorators();
  var exitBtn = this.entity_.create('btn');
  _.decorate(exitBtn, d.shape.text, {text: 'x', size: 40});
  _.decorate(exitBtn, d.clickable);
  exitBtn.staticPosition = true;
  this.gm_.entities.add(exitBtn, 'exitBtn');
};

EquipScene.prototype.createInventory_ = function() {
  var d = this.entityDecorator_.getDecorators();

  this.inventory_ = [];
  for (var i = 0; i < EquipScene.MAX_INVENTORY_SIZE; i++) {
    var slot = this.entity_.create('inventorySlot');
    _.decorate(slot, d.shape.circle, {radius: 35});
    _.decorate(slot, d.clickable);
    _.decorate(slot, d.staticPosition);
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

EquipScene.prototype.removeEntities_ = function() {
  this.gm_.entities.clear();
};

EquipScene.prototype.update = function() {
  if (this.gm_.scenes['equip'] != 'active') return;
  this.positionInventory_();
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
  exitBtn.x = this.screen_.pixelWidth - 30;
  exitBtn.y = 30;

  if (exitBtn.clicked) {
    this.gm_.scenes['equip'] = 'inactive';
    this.removeEntities_();
    this.gm_.scenes['battle'] = 'start';
  }
};

EquipScene.prototype.positionInventory_ = function() {
  var GAP = this.inventory_[0].radius * this.screen_.upscale;
  var COLS = EquipScene.MAX_INVENTORY_SIZE / 2;
  var WIDTH = this.inventory_[0].radius * 2 * this.screen_.upscale;
  var x = -((COLS - 1) * (WIDTH + GAP)) / 2;
  for (var i = 0; i < this.inventory_.length / 2; i ++) {
    var dy = (WIDTH + GAP) / 2;

    var topSlot = this.inventory_[i];
    topSlot.setPos(x, -dy);

    var bottomSlot = this.inventory_[i + this.inventory_.length / 2];
    bottomSlot.setPos(x, dy);

    x += WIDTH + GAP;

    if (!this.screen_.portrait) {
      bottomSlot.setPos(bottomSlot.staticY, bottomSlot.staticX);
      topSlot.setPos(topSlot.staticY, topSlot.staticX);
    }
  }
};

EquipScene.prototype.resolve = function(dt) {
  if (this.gm_.scenes['equip'] == 'start') {
    this.start();
    this.update(dt);
  }
};
