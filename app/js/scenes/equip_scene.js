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
  _.each(this.inventory_, function(slot, i) {
    this.gm_.entities['inventorySlot' + i] = slot;
  }, this);
};

EquipScene.prototype.createInventory_ = function() {
  var d = this.entityDecorator_.getDecorators();

  this.inventory_ = [];
  for (var i = 0; i < EquipScene.MAX_INVENTORY_SIZE; i++) {
    var slot = this.entity_.create('inventorySlot');
    _.decorate(slot, d.shape.circle, {radius: 30});
    _.decorate(slot, d.clickable);
    slot.equiped = false;
    this.inventory_.push(slot);
  }

  _.each(this.gm_.player.inventory, function(item, i) {
    var slot = this.inventory_[i];
    slot.item = item;
    slot.equiped = this.isEquiped_(item);
  }, this);
};

EquipScene.prototype.isEquiped_ = function(item) {
  _.each(this.gm_.player.spec, function(name, spec) {
  });
  return false;
};

EquipScene.prototype.positionInventory_ = function() {
  var GAP = 10;
  var COLS = EquipScene.MAX_INVENTORY_SIZE / 2;
  var WIDTH = this.inventory_[0].radius * 2;
  var x = -((COLS - 1) * (WIDTH + GAP)) / 2;
  for (var i = 0; i < this.inventory_.length / 2; i ++) {
    var dy = (WIDTH + GAP) / 2;
    var topSlot = this.inventory_[i];
    topSlot.x = x;
    topSlot.y = -dy;

    var bottomSlot = this.inventory_[i + this.inventory_.length / 2];
    bottomSlot.x = x;
    bottomSlot.y = dy;

    x += WIDTH + GAP;
  }
};

EquipScene.prototype.update = function() {
  if (this.gm_.scenes['equip'] != 'active') return;
  for (var i = 0; i < EquipScene.MAX_INVENTORY_SIZE; i++) {

  }
};

EquipScene.prototype.resolve = function(dt) {
  if (this.gm_.scenes['equip'] == 'start') {
    this.start();
  }
};
