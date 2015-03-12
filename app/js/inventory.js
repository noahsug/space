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

Inventory.prototype.isNotEquipped = function(item) {
  return !this.isEquipped(item);
};

Inventory.prototype.equip = function(item) {
  this.gm_.player.push(item);
};

Inventory.prototype.unequip = function(item) {
  var equipIndex = this.getEquippedIndex_(item);
  this.gm_.player.splice(equipIndex, 1);
};

Inventory.prototype.getUnequippedByLevel = function(level) {
  var levels = _.range(0, level + 1).reverse().
      concat(_.range(level + 1, Game.MAX_LEVEL + 1));
  for (var i = 0; i < levels.length; i++) {
    var items = _.filter(
        this.itemService_.getByLevel(levels[i]), this.isNotEquipped, this);
    if (items.length) return items;
  }
  // The player has every item!
  return null;
};

Inventory.prototype.getEquippedIndex_ = function(item) {
  return this.itemService_.getIndexByTypeFrom(this.gm_.player, item);
};

Inventory.prototype.hasItemToEquip = function() {
  return this.gm_.player.length - 1 < this.gm_.inventory.length;
};
