var GameplayParser = di.service('GameplayParser', [
  'gameplayFile', 'gameplay']);

var gameplay = di.constant('gameplay', {init: {}, items: {}});

GameplayParser.prototype.init = function() {
  this.parseItemObj_(this.gameplayFile_.init);
};

GameplayParser.prototype.parseItemObj_ = function(itemObj) {
  _.each(itemObj, function(itemList, key) {
    this.gameplay_.init[key] = this.parseItemList_(itemList);
  }, this);
};

GameplayParser.prototype.parseItemList_ = function(itemList) {
  var parsedItemList = [];
  _.each(itemList, function(item) {
    parsedItemList.push(this.parseItem_(item));
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
