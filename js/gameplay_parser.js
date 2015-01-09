var GameplayParser = di.service('GameplayParser', [
  'gameplayFile', 'gameplay']);

var gameplay = di.constant('gameplay', {init: {}, items: {}});

GameplayParser.prototype.init = function() {
  // Parse items.
  this.gameplay_.items = {};
  _.each(this.gameplayFile_.items, function(info, name) {
    this.gameplay_.items[name] = this.parseItem_(name);
  }, this);

  // Parse initial inventory and equipment.
  this.parseItemObj_(this.gameplayFile_.init, this.gameplay_.init);

  // Parse enemies for each level.
  this.gameplay_.level = [];
  for (var i = 0; i < this.gameplayFile_.level.length; i++) {
    this.gameplay_.level.push({});
    this.parseItemObj_(this.gameplayFile_.level[i], this.gameplay_.level[i]);
  }
};

GameplayParser.prototype.parseItemObj_ = function(itemObj, destination) {
  _.each(itemObj, function(itemList, key) {
    destination[key] = this.parseItemList_(itemList);
  }, this);
};

GameplayParser.prototype.parseItemList_ = function(itemList) {
  var parsedItemList = [];
  _.each(itemList, function(item) {
    parsedItemList.push(this.gameplay_.items[item]);
  }, this);
  return parsedItemList;
};

GameplayParser.prototype.parseItem_ = _.memoize(function(name) {
  var item = _.clone(this.gameplayFile_.items[name]);
  _.assert(item, 'Invalid item: ' + name);
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
});