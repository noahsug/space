var ItemService = di.service('ItemService', [
  'Gameplay', 'GameModel as gm']);

ItemService.prototype.get = function() {
  return this.gameplay_.items;
};

ItemService.prototype.getByName = function(name) {
  return _.findWhere(this.gameplay_.items, {name: name});
};

ItemService.prototype.getByLevel = function(level) {
  return _.where(this.gameplay_.items, {level: level});
};

ItemService.prototype.getByType = function(type) {
  return _.where(this.gameplay_.items, {category: type});
};

ItemService.prototype.getByTypeAndLevel = function(type, level) {
  return _.where(this.gameplay_.items, {level: level, category: type});
};

ItemService.prototype.getEnemyEquipped = function(type) {
  return _.findWhere(this.gm_.level.enemy, {category: type});
};
