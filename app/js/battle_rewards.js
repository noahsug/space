var BattleRewards = di.service('BattleRewards', [
  'GameModel as gm', 'Inventory', 'ItemService']);

BattleRewards.prototype.calculateRewards = function() {
  this.numItems_ = 0;
  this.items_ = {};

  if (!this.gm_.level.hasItem) return;

  // Uncomment to always get enemy's items.
  //_.each(Game.ITEM_TYPES, function(type) {
  //  var item = this.itemService_.getEnemyEquipped(type);
  //  if (item && !this.inventory_.hasItem(item)) {
  //    this.items_[type] = item;
  //    this.numItems_++;
  //  }
  //}, this);

  // Always return at least one reward if possible.
  if (!this.numItems_) {
    var levelRange = _.r.nextFloat(
        Game.MAX_ITEM_LEVEL / this.gm_.worlds.length);
    var level = Math.round(
        this.gm_.world.index / this.gm_.worlds.length + levelRange);
    //var item = this.getRandomItem_(this.gm_.level.type);
    var item = this.getRandomItem_(level);
    if (item) {
      this.items_[item.category] = item;
      this.numItems_++;
    }
  }
};

BattleRewards.prototype.getRandomItem_ = function(level) {
  var r = Math.random();
  if (level && r < .52) level--;
  if (level && r < .25) level--;
  if (level && r < .11) level--;
  return _.sample(this.inventory_.getUnownedByLevel(level));
};

BattleRewards.prototype.numItems = function() {
  return this.numItems_;
};

BattleRewards.prototype.getReward = function(type) {
  return this.items_[type] || {};
};
