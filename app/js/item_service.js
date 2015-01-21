var ItemService = di.service('ItemService', [
  'GameModel as gm']);

ItemService.prototype.get = function(type) {
  return this.getFrom(this.gm_.items, type);
};

ItemService.prototype.getFrom = function(list, type) {
  return _.where(list, {category: type});
};

ItemService.prototype.getIndexFrom = function(list, item) {
  return _.findIndexWhere(list, {name: item.name});
};
