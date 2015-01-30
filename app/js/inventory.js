var Inventory = di.service('Inventory', [
  'GameModel as gm', 'ItemService']);

Inventory.prototype.has = function(type) {
  return !!this.get(type).length;
};

Inventory.prototype.get = function(type) {
  return this.itemService_.getByTypeFrom(this.gm_.inventory, type);
};

Inventory.prototype.isEquipped = function(item) {
  return this.getEquippedIndex_(item) >= 0;
};

Inventory.prototype.equip = function(item) {
  this.gm_.player.push(item);
};

Inventory.prototype.unequip = function(item) {
  var equipIndex = this.getEquippedIndex_(item);
  this.gm_.player.splice(equipIndex, 1);
};

Inventory.prototype.getEquippedIndex_ = function(item) {
  return this.itemService_.getIndexByTypeFrom(this.gm_.player, item);
};

Inventory.prototype.hasItemToEquip = function() {
  return this.gm_player.length < this.gm_inventory.length;
};
