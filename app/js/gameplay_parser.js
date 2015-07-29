var GameplayParser = di.factory('GameplayParser');

GameplayParser.prototype.parse = function(data) {
  this.data_ = data;
  this.parseItems_(data.items);
  this.parseWorlds_(data.worlds);
  this.parseItemList_(data.player);
  this.parseItemList_(data.inventory);
};

GameplayParser.prototype.parseItems_ = function(items) {
  _.each(items, function(item, name) {
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
  });
};

GameplayParser.prototype.parseWorlds_ = function(worlds) {
  _.each(worlds, function(world, index) {
    world.index = index;
    world.displayName = world.displayName || world.name;
    this.parseMissions_(world.missions, worlds);
  }, this);
};

GameplayParser.prototype.parseMissions_ = function(missions, worlds, items) {
  _.each(missions, function(mission, missionIndex) {
    mission.index = missionIndex;
    mission.maxFuel = mission.fuel;
    this.parseStages_(mission.stages, mission);
  }, this);
};

GameplayParser.prototype.parseStages_ = function(indexes, stages) {
  stages[0] = {empty: true};
  _.each2D(indexes, function(index, rowIndex, colIndex, array) {
    var stage = _.assert(stages[index]);
    array[colIndex] = stage;
    stage.unlocks = stage.unlocks || [];
    if (!stage.empty) {
      stage.start = index == 1;
      this.parseUnlocks_(stage.unlocks, stages);
      this.parseShip_(stage.ship);
      this.parseReward_(stage.reward);
    }
  }, this);
};

GameplayParser.prototype.parseUnlocks_ = function(unlocks, stages) {
  _.each(unlocks || [], function(unlock, index) {
    unlocks[index] = _.assert(stages[unlock]);
  }, this);
};

GameplayParser.prototype.parseReward_ = function(reward) {
  if (!reward) return;
  if (reward.type == 'item') {
    reward.value = this.data_.items[reward.value];
  }
  if (reward.type == 'world') {
    reward.value = _.findWhere(this.data_.worlds, {name: reward.value});
  }
};

GameplayParser.prototype.parseShip_ = function(ship) {
  ship.hull = this.data_.items[ship.hull];
  _.each(Game.ITEM_TYPES, function(type) {
    if (!ship[type]) return;
    ship[type] = _.map(ship[type], function(itemName) {
      return this.data_.items[itemName];
    }, this);
  }, this);
  return ship;
};

GameplayParser.prototype.parseItemList_ = function(names) {
  _.each(names, function(name, index) {
    names[index] = this.data_.items[name];
  }, this);
};
