var GameplayParser = di.service('GameplayParser');

GameplayParser.prototype.parse = function(file, dest) {
  // Parse items.
  dest.items = {};
  _.each(file.items, function(item, name) {
    dest.items[name] = this.parseItem_(name, item);
  }, this);

  dest.player = this.parseItemList_(file.player, dest.items);
  dest.inventory = this.parseItemList_(file.inventory, dest.items);

  // Parse enemies for each level.
  dest.bosses = [];
  for (var i = 0; i < file.bosses.length; i++) {
    dest.bosses[i] = this.parseItemList_(file.bosses[i], dest.items);
  }
};

GameplayParser.prototype.parseItemList_ = function(names, items) {
  var parsedItemList = [];
  _.each(names, function(name) {
    parsedItemList.push(items[name]);
  }, this);
  return parsedItemList;
};

GameplayParser.prototype.parseItem_ = function(name, item) {
  item = _.clone(item);
  var types = item.type.split('.');
  if (types.length > 1) {
    item.category = types[0];
    item.type = types[1];
  } else {
    item.category = 'base';
    item.type = types[0];
  }
  item.name = name;
  return item;
};
