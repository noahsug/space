var EquipScene = di.service('EquipScene', [
  'GameModel as gm', 'Screen', 'Entity', 'EntityDecorator', 'gameplay']);

EquipScene.MAX_INVENTORY_SIZE = 8;

EquipScene.prototype.init = function() {
  this.name = 'equip';
};

EquipScene.prototype.addEntities = function() {
  this.createInventory_();
  _.each(this.inventory_, function(slot) {
    this.gm_.entities.add(slot);
  }, this);

  var d = this.entityDecorator_.getDecorators();
  var exitBtn = this.entity_.create('btn');
  _.decorate(exitBtn, d.shape.text, {text: 'done', size: 20});
  _.decorate(exitBtn, d.clickable);
  _.decorate(exitBtn, d.staticPosition);
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

EquipScene.prototype.update = function(dt, state) {
  var exitBtn = this.gm_.entities.obj['exitBtn'];
  if (exitBtn.clicked) {
    this.gm_.scenes[this.name] = 'inactive';
    this.removeEntities_();
    this.gm_.scenes['result'] = 'start';
    return;
  }

  exitBtn.setPos(0, this.screen_.pixelHeight / 2 - 45 * this.screen_.upscale);

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
};

EquipScene.prototype.positionInventory_ = function() {
  var GAP = 10 * this.screen_.upscale;
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

    bottomSlot.setY(bottomSlot.staticY - 40);
    topSlot.setY(topSlot.staticY - 40);
  }
};
