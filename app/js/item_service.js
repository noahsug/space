var ItemService = di.service('ItemService', [
  'Gameplay']);

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
  return this.getByTypeFrom(this.gameplay_.items, type);
};

ItemService.prototype.getByTypeAndLevel = function(type, level) {
  return _.where(this.gameplay_.items, {level: level, category: type});
};

ItemService.prototype.getByTypeFrom = function(list, type) {
  return _.where(list, {category: type});
};

ItemService.prototype.getIndexByTypeFrom = function(list, item) {
  return _.findIndexWhere(list, {name: item.name});
};
