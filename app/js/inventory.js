var Inventory = di.service('Inventory', [
  'GameModel as gm', 'ItemService']);

Inventory.prototype.hasItem = function(item) {
  return !!_.findWhere(this.gm_.inventory, {name: item.name});
};

Inventory.prototype.has = function(type) {
  return !!this.get(type).length;
};

Inventory.prototype.get = function(type) {
  return _.where(this.gm_.inventory, {category: type});
};

Inventory.prototype.getEquipped = function(type) {
  return _.findWhere(this.gm_.player, {category: type});
};

Inventory.prototype.isEquipped = function(item) {
  return this.getEquippedIndex_(item) >= 0;
};

Inventory.prototype.equip = function(item) {
  this.gm_.player.push(item);
  _.sortBy(this.gm_.player, 'level');
};

Inventory.prototype.add = function(item) {
  if (this.hasItem(item)) return;
  this.gm_.inventory.push(item);
};

Inventory.prototype.remove = function(item) {
  if (!this.hasItem(item)) return;
  var index = _.findIndexWhere(this.gm_.inventory, {name: item.name});
  this.gm_.inventory.splice(index, 1);
  this.unequip(item);
};

Inventory.prototype.unequip = function(item) {
  var equipIndex = this.getEquippedIndex_(item);
  if (equipIndex >= 0) this.gm_.player.splice(equipIndex, 1);
};

Inventory.prototype.getUnownedByLevel = function(level) {
  var levels = _.range(0, level + 1).reverse().
      concat(_.range(level + 1, Game.MAX_LEVEL + 1));
  for (var i = 0; i < levels.length; i++) {
    var items = _.filter(this.itemService_.getByLevel(levels[i]),
                         _.negate(this.hasItem.bind(this)));
    if (items.length) return items;
  }
  // The player has every item!
  return [];
};

Inventory.prototype.getEquippedIndex_ = function(item) {
  return _.findIndexWhere(this.gm_.player, {name: item.name});
};

Inventory.prototype.hasItemToEquip = function() {
  return this.gm_.player.length - 1 < this.gm_.inventory.length;
};
