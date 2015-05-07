var GameplayParser = di.service('GameplayParser');

GameplayParser.prototype.parse = function(file, dest) {
  dest.items = this.parseItems_(file.items);
  dest.stages = this.parseStages_(file.stages, dest.items);
  dest.worlds = this.parseWorlds_(file.worlds, dest.stages);
  dest.player = this.parseItemList_(file.player, dest.items);
  dest.inventory = this.parseItemList_(file.inventory, dest.items);
};

GameplayParser.prototype.parseItems_ = function(items) {
  var result = {};
  _.each(items, function(item, name) {
    item = _.clone(item);
    var types = item.id.split('.');
    if (types.length > 1) {
      item.category = types[0];
      item.type = types[1];
    } else {
      item.category = 'base';
      item.type = types[0];
    }
    item.name = name;
    item.displayName = item.displayName || name;
    result[name] = item;
  });
  return result;
};

GameplayParser.prototype.parseStages_ = function(stages, items) {
  var result = {};
  _.each(stages, function(stage, name) {
    stage = _.clone(stage);
    stage.hull = items[stage.hull];
    _.each(Game.ITEM_TYPES.concat(['augment']), function(type) {
      if (!stage[type]) return;
      stage[type] = stage[type].map(function(itemName) {
        return items[itemName];
      });
    });
    result[name] = stage;
  });
  return result;
};

GameplayParser.prototype.parseWorlds_ = function(worlds, stages) {
  return _.map(worlds, function(world, index) {
    world = _.clone(world);
    world.index = index;
    world.stages = this.parseWorldStages_(world.stages, stages);
    return world;
  }, this);
};

GameplayParser.prototype.parseWorldStages_ = function(names, stages) {
  return names.map(function(row, rowIndex) {
    return row.map(function(stageName, colIndex) {
      if (stageName == '-') return {empty: true};
      var stage = _.deepClone(stages[stageName]);
      stage.row = rowIndex;
      stage.col = colIndex;
      return stage;
    });
  });
};

GameplayParser.prototype.parseItemList_ = function(names, items) {
  return names.map(function(name) { return items[name]; });
};
