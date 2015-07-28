var Inventory = di.service('Inventory', [
  'GameModel as gm', 'ItemService']);

Inventory.prototype.hasItem = function(item) {
  return !!_.findWhere(this.gm_.inventory, {name: item.name});
};

Inventory.prototype.has = function(type) {
  return !!this.getEquipped(type) || !!this.get(type).length;
};

Inventory.prototype.get = function(type) {
  return _.where(this.gm_.inventory, {category: type});
};

Inventory.prototype.getEquipped = function(type) {
  var items = _.where(this.gm_.player, {category: type});
  return type == 'augment' ? items : items[0];
};

Inventory.prototype.isEquipped = function(item) {
  return this.getEquippedIndex_(item) >= 0;
};

Inventory.prototype.equip = function(item) {
  this.gm_.player.push(item);
};

Inventory.prototype.getHull = function() {
  return _.findWhere(this.gm_.player, {category: 'hull'});
};

Inventory.prototype.add = function(item) {
  if (this.hasItem(item)) return;
  this.gm_.inventory.splice(0, 0, item);
};

Inventory.prototype.remove = function(item) {
  if (!this.hasItem(item)) return;
  var index = _.findIndexWhere(this.gm_.inventory, {name: item.name});
  this.gm_.inventory.splice(index, 1);
  this.unequip(item);
};

Inventory.prototype.removeAugments = function() {
  _.each(this.getEquipped('augment'), function(item) {
    this.unequip(item);
  }, this);
};

Inventory.prototype.unequip = function(item) {
  var equipIndex = this.getEquippedIndex_(item);
  if (equipIndex >= 0) this.gm_.player.splice(equipIndex, 1);
};

Inventory.prototype.getEquippedIndex_ = function(item) {
  return _.findIndexWhere(this.gm_.player, {name: item.name});
};
