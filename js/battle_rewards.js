var BattleRewards = di.service('BattleRewards', [
  'GameModel as gm', 'Inventory', 'ItemService']);

BattleRewards.prototype.calculateRewards = function() {
  this.numItems_ = 0;
  this.items_ = {};

  if (!this.gm_.level.hasItem && !this.gm_.level.hasAugment) return;

  // Give 4 items if last level.
  if (this.gm_.level.index == this.gm_.world.levels.length - 1) {
    _.each(Game.ITEM_TYPES, function(type) {
      var level = this.getRandomLevel_();
      var item = _.sample(this.inventory_.getUnownedByLevelAndType(
          level, type));
      if (item) this.rewardItem_(item);
    }, this);
    return;
  }

  // Give one random item or augment.
  var level = this.getRandomLevel_();
  var item = this.getRandomItem_(level, this.gm_.level.hasAugment);
  if (item) this.rewardItem_(item);

  // Get enemy's items.
  //_.each(Game.ITEM_TYPES, function(type) {
  //  var item = this.itemService_.getEnemyEquipped(type);
  //  if (item && !this.inventory_.hasItem(item)) {
  //    this.items_[type] = item;
  //    this.numItems_++;
  //  }
  //}, this);
};

BattleRewards.prototype.getRandomLevel_ = function() {
  var levelRange = _.r.nextFloat(Game.MAX_ITEM_LEVEL / this.gm_.worlds.length);
  return Math.round(this.gm_.world.index / this.gm_.worlds.length + levelRange);
};

BattleRewards.prototype.getRandomItem_ = function(level, returnAugment) {
  var r = Math.random();
  if (level && r < .52) level--;
  if (level && r < .25) level--;
  if (level && r < .11) level--;
  return _.sample(this.inventory_.getUnownedByLevel(level, returnAugment));
};

BattleRewards.prototype.rewardItem_ = function(item) {
  this.items_[item.category] = item;
  this.numItems_++;
  if (item.category == 'augment') {
    this.inventory_.equip(item);
    this.gm_.world.augments.push(item);
  }
};

BattleRewards.prototype.numItems = function() {
  return this.numItems_;
};

BattleRewards.prototype.getReward = function(type) {
  return this.items_[type] || {};
};
